#!/usr/bin/env python3
"""Make ISA's recorded lines with Azure AI Speech (voice vi-VN-HoaiMyNeural).

Why: the built-in Vietnamese voice of most iPhones and iPads says "bé" as "mớ", and Safari gives websites
no other voice. Lines that have a recorded clip are played from the file instead, on every device.

What it does: sends each line below to Azure text to speech, saves audio/isa/<id>.mp3, and rewrites
js/isa-voice.js (the list the app reads). Only the lines below leave this computer — no user data.

The key is never written into the project and never printed. Give it in ONE of these ways:
  - environment variables AZURE_SPEECH_KEY and AZURE_SPEECH_REGION, or
  - a text file OUTSIDE the project (default: ../azure-speech-key.txt): line 1 = key, line 2 = region
    (for example southeastasia).

Use:
  py tools/make_isa_voice.py              make the clips that are missing
  py tools/make_isa_voice.py --force      make every clip again (after changing voice, rate or pitch)
  py tools/make_isa_voice.py --only dung  only the clips whose id contains "dung"
  py tools/make_isa_voice.py --list       show the lines, make nothing

Changing a line in js/core.js? Change it here too and run the script again; a line without a clip is
simply read by the device's voice.
"""
import argparse
import os
import sys
import time
import urllib.error
import urllib.request
from xml.sax.saxutils import escape

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, 'audio', 'isa')
MANIFEST = os.path.join(ROOT, 'js', 'isa-voice.js')
DEFAULT_KEY_FILE = os.path.join(os.path.dirname(ROOT), 'azure-speech-key.txt')

# id (file name) → the exact line as the app says it (js/core.js)
LINES = [
    # ISA on a home card while the child slides over it
    *[(f'lop-{n}', f'Bé ơi, lớp {n} nè!') for n in range(1, 6)],
    ('on-tap', 'Bé ơi, ôn tập nè!'),
    *[(f'de-lop-{n}', f'Bé ơi, đề lớp {n} nè!') for n in range(1, 6)],
    # a tap on a card
    ('di-thoi', 'Đi thôi!'),
    ('lam-de-nao', 'Làm đề nào!'),
    ('co-len-nao', 'Cố lên nào!'),
    # home greeting ("Chào <tên bé>!" stays with the device voice)
    ('chao-be', 'Chào bé!'),
    ('hom-nay-co-gang', 'Hôm nay bé cố gắng học tốt nhé!'),
    ('hom-nay-du-muc-tieu', 'Hôm nay bé đã làm đủ mục tiêu rồi nhé!'),
    # answers
    ('dung-roi', 'Đúng rồi bé ơi!'),
    ('thu-lai', 'Chưa đúng, bé thử lại nhé.'),
    # result of a lesson or a paper, by score
    ('kq-top-1', 'Bé làm rất tốt!'),
    ('kq-top-2', 'Bé làm rất tốt! Bé cứ chăm chỉ như vậy nhé!'),
    ('kq-top-3', 'Bé làm rất tốt! Mình học tiếp bài sau nhé!'),
    ('kq-good-1', 'Bé làm tốt lắm! Bé hãy cố gắng thêm chút nữa nhé!'),
    ('kq-good-2', 'Bé làm tốt lắm! Cố gắng thêm một chút là bé được 10 điểm nhé!'),
    ('kq-ok-1', 'Bé hãy cố gắng nhé! Mình xem lại các câu sai cùng nhau nha.'),
    ('kq-ok-2', 'Bé hãy cố gắng nhé! Làm lại một lần nữa là bé tiến bộ ngay.'),
    ('kq-low-1', 'Không sao đâu! Bé cố gắng lên vào lần kế tiếp nhé!'),
    ('kq-low-2', 'Bé cố gắng lên vào lần kế tiếp nhé! ISA luôn ở bên bé.'),
    # "Nghe thử" in Góc phụ huynh
    ('minh-la-isa', 'Mình là Rô-bốt ISA.'),
]


def read_key(path):
    key = os.environ.get('AZURE_SPEECH_KEY', '').strip()
    region = os.environ.get('AZURE_SPEECH_REGION', '').strip()
    if (not key or not region) and os.path.isfile(path):
        with open(path, encoding='utf-8-sig') as f:
            rows = [r.strip() for r in f.read().splitlines() if r.strip()]
        key = key or (rows[0] if rows else '')
        region = region or (rows[1] if len(rows) > 1 else '')
    return key, region.lower().replace(' ', '')


def synth(text, key, region, voice, rate, pitch):
    ssml = (f"<speak version='1.0' xml:lang='vi-VN'><voice name='{voice}'>"
            f"<prosody rate='{rate}' pitch='{pitch}'>{escape(text)}</prosody></voice></speak>")
    req = urllib.request.Request(
        f'https://{region}.tts.speech.microsoft.com/cognitiveservices/v1',
        data=ssml.encode('utf-8'), method='POST',
        headers={
            'Ocp-Apim-Subscription-Key': key,
            'Content-Type': 'application/ssml+xml',
            'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
            'User-Agent': 'isa-voice-maker',
        })
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            if e.code == 429 and attempt < 3:      # too many requests: wait and try again
                time.sleep(5 * (attempt + 1))
                continue
            hint = {401: 'the key or the region is wrong', 403: 'the key has no access to this region or tier',
                    400: 'the voice name or the text was refused'}.get(e.code, '')
            raise SystemExit(f'Azure answered {e.code} {e.reason}' + (f' — {hint}' if hint else ''))
        except urllib.error.URLError as e:
            raise SystemExit(f'Cannot reach Azure ({e.reason}). Check the region name and the network.')


def write_manifest(voice):
    have = [(i, t) for i, t in LINES if os.path.isfile(os.path.join(OUT_DIR, i + '.mp3'))]
    # one JS string per line: keep the Vietnamese letters, escape only the backslash and the single quote
    rows = ''.join("    '" + t.replace("\\", "\\\\").replace("'", "\\'") + f"': '{i}.mp3',\n" for i, t in have)
    body = ("/* ISA's recorded lines — written by tools/make_isa_voice.py, do not edit by hand.\n"
            "   clips: the exact line ISA says → its sound file in `dir`. A line without a clip is read by the device's voice. */\n"
            "window.ISA_VOICE = {\n"
            "  dir: 'audio/isa/',\n"
            f"  voice: '{voice if have else ''}',\n"
            "  clips: {" + ('\n' + rows + '  ' if have else '') + "},\n"
            "};\n")
    with open(MANIFEST, 'w', encoding='utf-8', newline='\n') as f:
        f.write(body)
    return len(have)


def main():
    ap = argparse.ArgumentParser(description="Make ISA's recorded lines with Azure AI Speech.")
    ap.add_argument('--voice', default='vi-VN-HoaiMyNeural')
    ap.add_argument('--rate', default='-6%', help="speaking rate, e.g. -6%% (slower) or +0%%")
    ap.add_argument('--pitch', default='+8%', help="pitch, e.g. +8%% (a little higher) or +0%%")
    ap.add_argument('--key-file', default=DEFAULT_KEY_FILE)
    ap.add_argument('--force', action='store_true', help='make every clip again')
    ap.add_argument('--only', default='', help='only ids containing this text')
    ap.add_argument('--list', action='store_true', help='show the lines and stop')
    a = ap.parse_args()
    out = sys.stdout
    if hasattr(out, 'reconfigure'):
        out.reconfigure(encoding='utf-8')

    ids = [i for i, _ in LINES]
    assert len(ids) == len(set(ids)), 'duplicate id in LINES'
    if a.list:
        for i, t in LINES:
            print(f'{i:22} {t}')
        print(f'{len(LINES)} lines, {sum(len(t) for _, t in LINES)} characters')
        return

    key, region = read_key(a.key_file)
    if not key or not region:
        raise SystemExit('No Azure key found. Set AZURE_SPEECH_KEY and AZURE_SPEECH_REGION, or put the key (line 1) '
                         f'and the region (line 2) in {a.key_file}')
    os.makedirs(OUT_DIR, exist_ok=True)
    made = skipped = 0
    for i, t in LINES:
        if a.only and a.only not in i:
            continue
        path = os.path.join(OUT_DIR, i + '.mp3')
        if os.path.isfile(path) and not a.force:
            skipped += 1
            continue
        audio = synth(t, key, region, a.voice, a.rate, a.pitch)
        if len(audio) < 500:
            raise SystemExit(f'{i}: Azure returned almost no sound ({len(audio)} bytes)')
        with open(path, 'wb') as f:
            f.write(audio)
        made += 1
        print(f'made  {i}.mp3  {len(audio) // 1024 + 1} KB  {t}')
        time.sleep(0.3)
    n = write_manifest(a.voice)
    print(f'{made} made, {skipped} already there; js/isa-voice.js lists {n} of {len(LINES)} lines')


if __name__ == '__main__':
    main()
