# UrbanistAI — Model Playground
**GSAPP Urban Tech, Innovations and Planning Institutions · Spring 2026**
[livingdatalab.com/courses/utipi](https://livingdatalab.com/courses/utipi/)

---

## What It Is

A standalone web app that closes the loop on the semester's collective data work. Students contributed and labeled over 1,200 urban photographs using a schema they built themselves. This app lets them upload any image and watch the model their class trained make predictions in real time — then interrogate what those predictions reveal and miss.

Deployed on **Netlify** (free static hosting). Inference runs on a **Vertex AI AutoML object detection endpoint** hosted on Google Cloud. The Vertex endpoint is time-bounded: deployed for the exploration window, then deleted.

---

## Three Pages

### 1 — Model Playground
Upload any street-level urban image — or pick from four built-in samples (Steps, Bench, Park, Office) — and run it through the class-trained model. Detected objects are drawn as annotated bounding boxes directly on the image. A confidence threshold slider lets students surface marginal detections and explore model uncertainty. Summary stats show total detections, how many clear the threshold, and the top confidence score.

> *"While an algorithm can quickly identify the binary action of 'sitting,' its inherent complexities offer a perfect platform to interrogate what a truly urbanist definition of human activity could be."*

### 2 — Label Schema
An interactive explorer of the hierarchical labeling schema the class developed. Six top-level categories (Intention, Activity, Social Orientation, Environment, Space/Support, Objects) expand into first-order groups and 36 individual label classes, with instance counts from the full dataset. Clicking any label surfaces its full description, machine label name, relative frequency bar, and — critically — all the original student tags that were merged into it (e.g. *resting, Reclined, Slouching, Chilling, Tired, leaning, sleeping, Laying, hanging, uncomfortable* all collapsed into `resting_reclined`). A search field filters across label names, subcategories, and original tags.

### 3 — Training Data
A gallery of 33 representative photographs from the student-contributed dataset. Each image went through a privacy pipeline before entering training: faces detected and blurred (MediaPipe + OpenCV Haar cascade), and all EXIF metadata (location, device, timestamp) stripped on upload. Clicking any image opens a full-screen lightbox with keyboard navigation.

---

## Technical Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Hosting | Netlify (static + serverless functions) |
| Inference proxy | Netlify Function (Node.js) — credentials never touch the browser |
| Model | Vertex AI AutoML Object Detection, `us-central1` |
| Auth | GCP Service Account JWT, signed with Web Crypto API — no extra dependencies |
| Image pre-processing | Client-side canvas resize + JPEG compression (max 1024px, stays under Vertex's 1.5MB request limit) |
| Fonts | Inter (body) · IBM Plex Sans (eyebrow labels) · IBM Plex Mono (numbers, codes, accents) |

---

## Privacy Pipeline (UrbanistAI backend)

All student-contributed images were processed server-side before storage and training:

- **Face detection:** MediaPipe (2-pass: close-up + distant) with OpenCV Haar cascade fallback · confidence threshold ≥ 0.7
- **Face blurring:** Gaussian blur with 10% padding around each detected bounding box
- **EXIF strip:** All metadata removed on upload — no location, device, or timestamp data retained
- **Resize:** Images scaled to max 1024px on longest dimension before storage

---

## Dataset at a Glance

| | |
|--|--|
| Total images contributed | 1,200+ |
| Label classes | 36 |
| Total labeled instances | 3,465 |
| Top-level categories | 6 |
| Sample images in app | 33 |

**Top labels by instance count:** `sitting` (586) · `socializing_interaction` (359) · `resting_reclined` (261) · `alone` (164) · `outdoors` (164) · `phone_device_use` (151)

---

## Deployment

```
# 4 environment variables needed in Netlify:
GCP_SERVICE_ACCOUNT_JSON   # full service account key JSON
VERTEX_PROJECT_ID          # e.g. utipi2026
VERTEX_ENDPOINT_ID         # numeric ID from Vertex AI console
VERTEX_LOCATION            # us-central1
```

**Cost:** ~$1.50–$3.50/day for 1 replica on Vertex AI. Delete the endpoint when the exploration window closes — the Netlify site itself is free indefinitely.

---

## Conceptual Framing

**Topic 2026: Sitting.** Sitting is a concrete, observable behavior — literally, a body on a surface — yet rich with urban meaning. Because it is defined by a recognizable pose, it is easily identified by computer vision. Yet as urbanists we are rarely satisfied with merely describing someone as "sitting." These second-order activities are precisely what drew William H. Whyte to observe New Yorkers in small urban spaces — drawing vital distinctions no binary label can capture. The model's predictions are a starting point for that conversation, not a conclusion.

---

*Built with Claude · Living Data Lab · Columbia GSAPP*
