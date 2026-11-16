#!/usr/bin/env python3
"""Regenerate subtitle text from episode 2 audio, retaining legacy cue timings when useful.

The source transcript is profoundly corrupted; its timestamp ranges are anchors,
NOT a trustworthy source of spoken words. Unknown words are never fabricated.
"""
import hashlib
import json
import os
import re
import sys
import urllib.request
from pathlib import Path

AUDIO_URL = "https://mcdn.podbean.com/mf/web/7jhwwj/podcast_ep2.mp3"
LEGACY = Path("titulky/vedatorsky-podcast-2-temna-hmota.srt")
BACKUP = Path("titulky/vedatorsky-podcast-2-temna-hmota.original.srt")
OUTPUT = Path("titulky/vedatorsky-podcast-2-temna-hmota.sk.srt")
REPORT = Path("titulky/vedatorsky-podcast-2-temna-hmota.review.json")
AUDIO = Path("/tmp/vedator-episode-2.mp3")


def download():
    request = urllib.request.Request(AUDIO_URL, headers={"User-Agent": "Mozilla/5.0 (Vedator subtitle restoration)"})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(request, timeout=120) as response, AUDIO.open("wb") as target:
                while True:
                    chunk = response.read(1024 * 1024)
                    if not chunk:
                        break
                    target.write(chunk)
            if AUDIO.stat().st_size < 1_000_000:
                raise RuntimeError("Downloaded audio is unusually small")
            return
        except Exception:
            if attempt == 2:
                raise


def timestamp_seconds(value):
    hh, mm, tail = value.strip().split(":")
    ss, ms = tail.split(",")
    return int(hh) * 3600 + int(mm) * 60 + int(ss) + int(ms) / 1000


def timestamp_srt(seconds):
    value = max(0, round(seconds * 1000))
    h, rem = divmod(value, 3_600_000)
    m, rem = divmod(rem, 60_000)
    s, ms = divmod(rem, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def load_legacy(text):
    cues = []
    for block in re.split(r"\n\s*\n", text.lstrip("\ufeff").replace("\r", "\n").strip()):
        m = re.search(r"(\d\d:\d\d:\d\d,\d{3})\s*-->\s*(\d\d:\d\d:\d\d,\d{3})", block)
        if m:
            cues.append({"start": timestamp_seconds(m.group(1)),
                         "end": timestamp_seconds(m.group(2)),
                         "text": block[m.end():].strip()})
    return cues


def wrap(text, width=43):
    words = text.split()
    lines = []
    current = ""
    for word in words:
        if current and len(current) + 1 + len(word) > width and len(lines) < 1:
            lines.append(current)
            current = word
        else:
            current = (current + " " + word).strip()
    if current:
        lines.append(current)
    return "\n".join(lines)


def spellcheck_terms(text):
    # Only unambiguous terminology substitutions. No invented content.
    substitutions = [
        (r"\bWIMPs?\b", "WIMP"),
        (r"\bMACHOs?\b", "MACHO"),
        (r"\b[Cc]erne\b", "CERN-e"),
        (r"\b[Zz]wicki\b", "Zwicky"),
        (r"\b[Hh]igsov\b", "Higgsov"),
    ]
    for pattern, replacement in substitutions:
        text = re.sub(pattern, replacement, text)
    return text.strip()


def chunks_from_words(words, anchors):
    """Keep word content from audio; prefer original timings, fill their gaps."""
    assigned = [[] for _ in anchors]
    uncovered = []
    for word in words:
        midpoint = (word["start"] + word["end"]) / 2
        candidate = None
        best_distance = float("inf")
        for i, cue in enumerate(anchors):
            # Accept words in the old interval, plus 70 ms tolerance.
            if cue["start"] - 0.07 <= midpoint <= cue["end"] + 0.07:
                distance = abs(midpoint - (cue["start"] + cue["end"]) / 2)
                if distance < best_distance:
                    candidate = i
                    best_distance = distance
        if candidate is None:
            uncovered.append(word)
        else:
            assigned[candidate].append(word)

    cues = []
    for anchor, group in zip(anchors, assigned):
        if not group:
            continue
        # New transcript text; original text is not copied because it is unusable.
        start = max(0, min(anchor["start"], group[0]["start"]))
        end = max(anchor["end"], group[-1]["end"])
        cues.append({"start": start, "end": end, "words": group, "basis": "legacy-timing"})

    # Group speech absent from the original into new subtitle cues.
    group = []
    for word in uncovered:
        if group:
            prev = group[-1]
            draft = " ".join(w["text"] for w in group)
            boundary = (
                word["start"] - prev["end"] >= 0.65
                or word["end"] - group[0]["start"] >= 5.4
                or len(draft) + len(word["text"]) >= 72
                or (len(draft) >= 27 and re.search(r"[.!?…]$", prev["text"]))
            )
            if boundary:
                cues.append({"start": group[0]["start"], "end": group[-1]["end"],
                             "words": group, "basis": "filled-gap"})
                group = []
        group.append(word)
    if group:
        cues.append({"start": group[0]["start"], "end": group[-1]["end"],
                     "words": group, "basis": "filled-gap"})

    cues.sort(key=lambda cue: (cue["start"], cue["end"]))
    # Reflow abnormally long original time anchors into multiple phrases if necessary.
    output = []
    for cue in cues:
        group = cue["words"]
        current = []
        for word in group:
            if current and (
                len(" ".join(w["text"] for w in current)) + len(word["text"]) >= 79
                or word["end"] - current[0]["start"] >= 6.2
            ):
                output.append({"start": current[0]["start"], "end": current[-1]["end"],
                               "words": current, "basis": cue["basis"]})
                current = []
            current.append(word)
        if current:
            output.append({"start": current[0]["start"], "end": current[-1]["end"],
                           "words": current, "basis": cue["basis"]})
    output.sort(key=lambda cue: cue["start"])
    return output


def main():
    from faster_whisper import WhisperModel

    old = LEGACY.read_text(encoding="utf-8-sig")
    anchors = load_legacy(old)
    assert len(anchors) >= 200, f"Unexpectedly short legacy SRT: {len(anchors)}"
    if not BACKUP.exists():
        BACKUP.write_text(old.lstrip("\ufeff"), encoding="utf-8")

    download()
    size = AUDIO.stat().st_size
    digest = hashlib.sha256(AUDIO.read_bytes()).hexdigest()
    print(f"Audio: {size} bytes sha256={digest}", flush=True)
    model = WhisperModel(os.getenv("WHISPER_MODEL", "medium"), device="cpu",
                         compute_type="int8", cpu_threads=4, num_workers=2)
    segments, info = model.transcribe(
        str(AUDIO),
        language="sk",
        task="transcribe",
        beam_size=5,
        best_of=5,
        temperature=0.0,
        condition_on_previous_text=True,
        initial_prompt=(
            "Vedátorský podcast. Samuel a Jozef hovoria o tmavej hmote a tmavej energii. "
            "Fritz Zwicky, Lord Kelvin, Henri Poincaré, Vera Rubinová, rotačné krivky galaxií, "
            "MACHO, WIMP, weakly interacting massive particle, CERN, supersymetria, "
            "reliktné žiarenie, baryónové akustické oscilácie, axióny, "
            "primordiálne čierne diery, gravitačné vlny."
        ),
        word_timestamps=True,
        vad_filter=False,
        no_speech_threshold=0.65,
    )
    words = []
    transcript = []
    uncertain = []
    for segment in segments:
        transcript.append({"start": round(segment.start, 2),
                           "end": round(segment.end, 2), "text": segment.text.strip(),
                           "avg_logprob": round(segment.avg_logprob, 3)})
        if segment.avg_logprob < -1:
            uncertain.append({"start": round(segment.start, 2),
                              "end": round(segment.end, 2), "text": segment.text.strip()})
        for word in segment.words or ():
            token = word.word.strip()
            if token and word.end >= word.start:
                words.append({"start": float(word.start),
                              "end": float(word.end),
                              "text": token,
                              "probability": round(float(word.probability), 3)})
    if len(words) < 450:
        raise RuntimeError(f"Only {len(words)} words: refusal to publish incomplete subtitles")
    cues = chunks_from_words(words, anchors)
    lines = []
    last_end = 0.0
    low_confidence = []
    for i, cue in enumerate(cues, 1):
        start = max(last_end, cue["start"])
        end = max(start + 0.8, cue["end"])
        if i < len(cues):
            end = min(end, cues[i]["start"] - 0.04)
        if end <= start:
            continue
        txt = spellcheck_terms(" ".join(w["text"] for w in cue["words"]))
        if not txt:
            continue
        if sum(w["probability"] < 0.3 for w in cue["words"]) > len(cue["words"]) / 2:
            low_confidence.append({"time": timestamp_srt(start), "text": txt})
        lines.append(f"{len(lines) + 1}\n{timestamp_srt(start)} --> {timestamp_srt(end)}\n{wrap(txt)}")
        last_end = end
    if len(lines) < 140:
        raise RuntimeError(f"Only {len(lines)} cues: refusal to publish incomplete subtitles")
    OUTPUT.write_text("\n\n".join(lines) + "\n", encoding="utf-8")
    REPORT.write_text(json.dumps({
        "episode": 2, "language": "sk", "status": "machine-draft-needs-listening-review",
        "audio_source": AUDIO_URL, "audio_sha256": digest, "audio_size": size,
        "model": os.getenv("WHISPER_MODEL", "medium"),
        "legacy_anchors": len(anchors), "recognized_words": len(words),
        "produced_cues": len(lines),
        "timing_from_old_srt": sum(c["basis"] == "legacy-timing" for c in cues),
        "filled_gap_cues": sum(c["basis"] == "filled-gap" for c in cues),
        "low_confidence_cues": low_confidence, "uncertain_segments": uncertain,
        "segment_count": len(transcript),
    }, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Created {OUTPUT} with {len(lines)} cues; {len(words)} recognized words; "
          f"{len(low_confidence)} low-confidence cues.", flush=True)


if __name__ == "__main__":
    main()
