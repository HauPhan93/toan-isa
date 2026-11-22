#!/usr/bin/env python3
"""Train the small digit network used as a second opinion by the handwriting pad (js/hand.js).

Data: MNIST (60 000 adult digits) + Vietnamese child-style digits rendered by the app itself
(tools/hand-styles.js → Hand.toImage, exported as a binary file: per sample 1 byte label + 784 bytes).
Both are 28 × 28, white digit on black, laid out like MNIST.

Model (~114 k weights, stored as int8 → ~115 KB):
  conv 5×5 1→16 + ReLU + max-pool 2  →  conv 5×5 16→32 + ReLU + max-pool 2  →  dense 1568→64 + ReLU  →  dense 64→10

Output: js/hand-cnn.js (window.HAND_CNN), read by js/hand.js.

Use (PyTorch CPU in its own environment):
  python tools/train_digit_cnn.py --mnist <dir with the 4 MNIST .gz files> --vn <vn-train.bin> [--epochs 8]
"""
import argparse, base64, gzip, json, os, struct, time
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def read_idx(path):
    with gzip.open(path, 'rb') as f:
        data = f.read()
    magic, n = struct.unpack('>II', data[:8])
    if magic == 2051:
        rows, cols = struct.unpack('>II', data[8:16])
        return np.frombuffer(data, np.uint8, offset=16).reshape(n, rows, cols)
    return np.frombuffer(data, np.uint8, offset=8)


def read_vn(path):
    raw = np.fromfile(path, np.uint8)
    raw = raw[: len(raw) // 785 * 785].reshape(-1, 785)
    return raw[:, 1:].reshape(-1, 28, 28), raw[:, 0].astype(np.int64)


class Net(nn.Module):
    def __init__(self):
        super().__init__()
        self.c1 = nn.Conv2d(1, 16, 5, padding=2)
        self.c2 = nn.Conv2d(16, 32, 5, padding=2)
        self.f1 = nn.Linear(32 * 7 * 7, 64)
        self.f2 = nn.Linear(64, 10)

    def forward(self, x):
        x = F.max_pool2d(F.relu(self.c1(x)), 2)
        x = F.max_pool2d(F.relu(self.c2(x)), 2)
        x = F.relu(self.f1(x.flatten(1)))
        return self.f2(x)


def augment(x):
    # small random rotation, scale, shear and shift (children's digits lean and wobble)
    n = x.shape[0]
    ang = (torch.rand(n) - 0.5) * 0.45
    sc = 0.88 + torch.rand(n) * 0.24
    sh = (torch.rand(n) - 0.5) * 0.3
    tx, ty = (torch.rand(n) - 0.5) * 0.16, (torch.rand(n) - 0.5) * 0.16
    cos, sin = torch.cos(ang) / sc, torch.sin(ang) / sc
    theta = torch.stack([torch.stack([cos, -sin + sh, tx], 1), torch.stack([sin, cos, ty], 1)], 1)
    grid = F.affine_grid(theta, x.shape, align_corners=False)
    return F.grid_sample(x, grid, align_corners=False, padding_mode='zeros')


def evaluate(net, x, y):
    net.eval()
    ok = 0
    with torch.no_grad():
        for i in range(0, len(x), 2000):
            ok += (net(x[i:i + 2000]).argmax(1) == y[i:i + 2000]).sum().item()
    return ok / len(x)


def q8(t):
    a = t.detach().numpy().astype(np.float32).ravel()
    scale = float(np.abs(a).max() / 127) or 1.0
    q = np.clip(np.round(a / scale), -127, 127).astype(np.int8)
    return {'shape': list(t.shape), 'scale': scale, 'b64': base64.b64encode(q.tobytes()).decode()}


def main():
    import sys
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    ap = argparse.ArgumentParser()
    ap.add_argument('--mnist', required=True)
    ap.add_argument('--vn', required=True)
    ap.add_argument('--epochs', type=int, default=8)
    ap.add_argument('--out', default=os.path.join(ROOT, 'js', 'hand-cnn.js'))
    a = ap.parse_args()
    torch.manual_seed(1)
    np.random.seed(1)

    mx = read_idx(os.path.join(a.mnist, 'train-images-idx3-ubyte.gz')); my = read_idx(os.path.join(a.mnist, 'train-labels-idx1-ubyte.gz')).astype(np.int64)
    tx = read_idx(os.path.join(a.mnist, 't10k-images-idx3-ubyte.gz')); ty = read_idx(os.path.join(a.mnist, 't10k-labels-idx1-ubyte.gz')).astype(np.int64)
    vx, vy = read_vn(a.vn)
    idx = np.random.permutation(len(vx)); cut = int(len(vx) * 0.9)
    vtr, vte = idx[:cut], idx[cut:]
    # the child-style set is smaller: count it twice so both kinds of writing weigh about the same
    X = np.concatenate([mx, vx[vtr], vx[vtr]]); Y = np.concatenate([my, vy[vtr], vy[vtr]])
    X = torch.tensor(X, dtype=torch.float32).unsqueeze(1) / 255; Y = torch.tensor(Y)
    TX = torch.tensor(tx, dtype=torch.float32).unsqueeze(1) / 255; TY = torch.tensor(ty)
    VX = torch.tensor(vx[vte], dtype=torch.float32).unsqueeze(1) / 255; VY = torch.tensor(vy[vte])
    print(f'train {len(X)} (MNIST {len(mx)} + child-style {cut}×2) · test MNIST {len(TX)} · test child-style {len(VX)}', flush=True)

    net = Net()
    opt = torch.optim.Adam(net.parameters(), lr=2e-3)
    steps = a.epochs * (len(X) // 128)
    sched = torch.optim.lr_scheduler.OneCycleLR(opt, max_lr=3e-3, total_steps=steps)
    for ep in range(a.epochs):
        net.train(); t0 = time.time()
        perm = torch.randperm(len(X))
        for i in range(0, len(X) - 127, 128):
            b = perm[i:i + 128]
            loss = F.cross_entropy(net(augment(X[b])), Y[b], label_smoothing=0.05)
            opt.zero_grad(); loss.backward(); opt.step(); sched.step()
        print(f'epoch {ep + 1}: loss {loss.item():.3f} · MNIST test {evaluate(net, TX, TY) * 100:.2f}% · child-style test {evaluate(net, VX, VY) * 100:.2f}% · {time.time() - t0:.0f}s', flush=True)

    weights = {k: q8(v) for k, v in net.state_dict().items()}
    # check the int8 weights still give the same answers
    qnet = Net(); sd = {}
    for k, w in weights.items():
        sd[k] = torch.tensor(np.frombuffer(base64.b64decode(w['b64']), np.int8).astype(np.float32) * w['scale']).reshape(w['shape'])
    qnet.load_state_dict(sd)
    print(f'int8 weights: MNIST test {evaluate(qnet, TX, TY) * 100:.2f}% · child-style test {evaluate(qnet, VX, VY) * 100:.2f}%', flush=True)
    meta = {'arch': 'c1(1→16,5,p2)-relu-pool2-c2(16→32,5,p2)-relu-pool2-f1(1568→64)-relu-f2(64→10)', 'input': '28x28, 0..1, white on black, MNIST layout (Hand.toImage)',
            'mnistTest': round(evaluate(qnet, TX, TY), 4), 'childTest': round(evaluate(qnet, VX, VY), 4)}
    with open(a.out, 'w', encoding='utf-8', newline='\n') as f:
        f.write('/* Small digit network for the handwriting pad — written by tools/train_digit_cnn.py, do not edit by hand.\n'
                f'   {meta["arch"]} · MNIST test {meta["mnistTest"] * 100:.1f}% · child-style test {meta["childTest"] * 100:.1f}% · int8 weights. */\n')
        f.write('window.HAND_CNN = ' + json.dumps({'meta': meta, 'w': weights}, separators=(',', ':')) + ';\n')
    print('wrote', a.out, os.path.getsize(a.out) // 1024, 'KB')


if __name__ == '__main__':
    main()
