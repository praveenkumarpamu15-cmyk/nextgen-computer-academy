"""NextGen Computer Academy — FastAPI Backend"""
from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Form, Header, Query, Response
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os, uuid, logging, requests, bcrypt, jwt, asyncio, io, csv, re
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone, timedelta

from emergentintegrations.llm.chat import LlmChat, UserMessage, TextDelta, StreamDone
import resend
from openpyxl import Workbook

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

MONGO_URL = os.environ['MONGO_URL']
DB_NAME = os.environ['DB_NAME']
EMERGENT_LLM_KEY = os.environ['EMERGENT_LLM_KEY']
JWT_SECRET = os.environ['JWT_SECRET']
APP_NAME = os.environ.get('APP_NAME', 'nextgen-academy')
ADMIN_EMAIL = os.environ['ADMIN_EMAIL']
ADMIN_PASSWORD = os.environ['ADMIN_PASSWORD']
STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"

# Email (Resend) — optional
RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "").strip()
SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "onboarding@resend.dev").strip()
if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY

def email_enabled() -> bool:
    return bool(RESEND_API_KEY)

async def send_email_async(to: str, subject: str, html: str) -> None:
    """Fire-and-forget email send. Silently no-ops if provider not configured."""
    if not email_enabled():
        logger.info("Email skipped (RESEND_API_KEY not set): %s", subject)
        return
    if not to:
        logger.info("Email skipped (no recipient): %s", subject)
        return
    try:
        params = {"from": SENDER_EMAIL, "to": [to], "subject": subject, "html": html}
        result = await asyncio.to_thread(resend.Emails.send, params)
        logger.info("Email sent id=%s to=%s", (result or {}).get("id"), to)
    except Exception as e:
        logger.error("Email send failed to=%s: %s", to, e)

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

app = FastAPI(title="NextGen Computer Academy API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ─────────────────────────── Object Storage ───────────────────────────
_storage_key: Optional[str] = None
def init_storage() -> Optional[str]:
    global _storage_key
    if _storage_key:
        return _storage_key
    try:
        r = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_LLM_KEY}, timeout=30)
        r.raise_for_status()
        _storage_key = r.json()["storage_key"]
        logger.info("Object storage initialized")
        return _storage_key
    except Exception as e:
        logger.error(f"Storage init failed: {e}")
        return None

def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    if not key:
        raise HTTPException(500, "Storage unavailable")
    r = requests.put(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key, "Content-Type": content_type}, data=data, timeout=120)
    r.raise_for_status()
    return r.json()

def get_object(path: str):
    key = init_storage()
    if not key:
        raise HTTPException(500, "Storage unavailable")
    r = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    r.raise_for_status()
    return r.content, r.headers.get("Content-Type", "application/octet-stream")

# ─────────────────────────── Auth ───────────────────────────
def create_token(email: str) -> str:
    payload = {"email": email, "exp": datetime.now(timezone.utc) + timedelta(days=7)}
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

def verify_token(auth: Optional[str], q: Optional[str] = None) -> str:
    token = None
    if auth and auth.startswith("Bearer "):
        token = auth.split(" ", 1)[1]
    elif q:
        token = q
    if not token:
        raise HTTPException(401, "Missing token")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload["email"]
    except jwt.PyJWTError:
        raise HTTPException(401, "Invalid token")

async def require_admin(authorization: Optional[str] = Header(None)) -> str:
    return verify_token(authorization)

# ─────────────────────────── Models ───────────────────────────
class LoginIn(BaseModel):
    email: str
    password: str

class BilingualText(BaseModel):
    en: str = ""
    te: str = ""

class ContactInfo(BaseModel):
    phone: str = "+91 90000 00000"
    whatsapp: str = "+919000000000"
    email: str = "info@nextgencomputeracademy.in"
    address_en: str = "Main Road, Your Town, Andhra Pradesh, India"
    address_te: str = "మెయిన్ రోడ్, మీ ఊరు, ఆంధ్రప్రదేశ్, ఇండియా"
    timings_en: str = "Mon – Sat, 9:00 AM – 8:00 PM"
    timings_te: str = "సోమవారం – శనివారం, ఉదయం 9:00 – రాత్రి 8:00"
    google_maps_embed: str = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3826.945!2d78.4867!3d17.3850!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTfCsDIzJzA2LjAiTiA3OMKwMjknMTIuMSJF!5e0!3m2!1sen!2sin!4v1700000000000"

class SiteContent(BaseModel):
    academy_name: BilingualText = Field(default_factory=lambda: BilingualText(en="NextGen Computer Academy", te="నెక్స్ట్‌జెన్ కంప్యూటర్ అకాడమీ"))
    tagline: BilingualText = Field(default_factory=lambda: BilingualText(en="Learn Today. Lead Tomorrow.", te="ఈరోజు నేర్చుకోండి... రేపు మీ భవిష్యత్తును మీరే నిర్మించుకోండి."))
    welcome: BilingualText = Field(default_factory=lambda: BilingualText(
        en="Welcome to NextGen Computer Academy — where practical computer education meets modern careers. We help students build real skills, confidence and opportunities for tomorrow.",
        te="నెక్స్ట్‌జెన్ కంప్యూటర్ అకాడమీకి స్వాగతం. ఇక్కడ మీరు ప్రాక్టికల్ కంప్యూటర్ ట్రైనింగ్‌తో పాటు, రేపటి కెరీర్‌కు కావలసిన అసలైన నైపుణ్యాలను నేర్చుకుంటారు."
    ))
    about: BilingualText = Field(default_factory=lambda: BilingualText(
        en="At NextGen Computer Academy we believe education must go beyond certificates. Every student gets hands-on practice, individual attention and real-world skills that make them job-ready and confident.",
        te="మా అకాడమీలో సర్టిఫికెట్ కంటే మీ నైపుణ్యానికి ఎక్కువ ప్రాముఖ్యత ఇస్తాము. ప్రతి విద్యార్థికి ప్రాక్టికల్ ట్రైనింగ్, వ్యక్తిగత శ్రద్ధ, రియల్ లైఫ్ స్కిల్స్‌తో పాటు కాన్ఫిడెన్స్ ఇస్తాము."
    ))
    vision: BilingualText = Field(default_factory=lambda: BilingualText(
        en="Education should build confidence, real skills and life opportunities. Our vision is to help every student stand on their own feet with modern computer knowledge.",
        te="ప్రతి విద్యార్థి తన కాళ్ల మీద తాను నిలబడే స్థాయికి చేరుకోవడం మా లక్ష్యం. చదువు అంటే ఆత్మవిశ్వాసం, నైపుణ్యం, అవకాశాలను ఇవ్వాలి."
    ))
    hero_image_url: str = "https://images.pexels.com/photos/5530447/pexels-photo-5530447.jpeg"
    logo_url: str = ""
    contact: ContactInfo = Field(default_factory=ContactInfo)
    ai_assistant_info: str = "You are NextGen AI Assistant. Help visitors with courses, fees, admissions, timings and general questions about the academy in a friendly, warm tone."
    owner_notification_email: str = ""
    owner_notification_whatsapp: str = ""
    notifications_enabled: bool = True
    enabled_notification_channels: List[str] = Field(default_factory=lambda: ["email"])
    seo: Dict[str, Any] = Field(default_factory=lambda: {
        "site_title": "NextGen Computer Academy — Learn Today. Lead Tomorrow.",
        "site_description": "Practical, bilingual (English + Telugu) computer training in your town. Courses: MS Office, Tally Prime, AI Tools, Typing, Career Skills. Small batches, individual attention, affordable fees.",
        "site_keywords": "computer academy, Tally Prime, MS Office, AI Tools, Telugu computer training, career skills, typing course, computer basics",
        "og_image": "https://images.pexels.com/photos/5530447/pexels-photo-5530447.jpeg",
        "canonical_url": "",
        "twitter_handle": "",
    })
    trainer: Dict[str, Any] = Field(default_factory=lambda: {
        "name": {"en": "Praveen Kumar", "te": "ప్రవీణ్ కుమార్"},
        "title": {"en": "Founder & Lead Trainer", "te": "వ్యవస్థాపకుడు & ప్రధాన శిక్షకుడు"},
        "photo_url": "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg",
        "bio": {
            "en": "Praveen Kumar founded NextGen Computer Academy with one simple belief: every student — no matter their background — deserves practical computer skills taught in a language they understand. With years of experience training students, working professionals and small business owners, he blends real-world workflows with easy step-by-step teaching.",
            "te": "ప్రవీణ్ కుమార్ గారు NextGen Computer Academy ని ఒక సాధారణ నమ్మకంతో ప్రారంభించారు — ప్రతి విద్యార్థికి, వారి నేపథ్యంతో సంబంధం లేకుండా, వారికి అర్థమయ్యే భాషలో ప్రాక్టికల్ కంప్యూటర్ నైపుణ్యాలు నేర్పించాలి. విద్యార్థులు, ఉద్యోగులు, చిన్న వ్యాపారులకు ఏళ్ల తరబడి ట్రైనింగ్ ఇస్తూ, రియల్ వర్ల్డ్ వర్క్‌ఫ్లోలను సులభమైన స్టెప్-బై-స్టెప్ పద్ధతిలో బోధిస్తారు."
        },
        "qualifications": [
            {"en": "M.C.A. — Master of Computer Applications", "te": "ఎం.సి.ఎ. — మాస్టర్ ఆఫ్ కంప్యూటర్ అప్లికేషన్స్"},
            {"en": "Tally Certified Trainer", "te": "టాలీ సర్టిఫైడ్ ట్రైనర్"},
            {"en": "Microsoft Office Specialist", "te": "మైక్రోసాఫ్ట్ ఆఫీస్ స్పెషలిస్ట్"},
            {"en": "10+ years teaching experience", "te": "10+ సంవత్సరాల బోధనానుభవం"},
        ],
        "mission": {
            "en": "\"To make every student confident with computers — from writing their first email to running a small business on Tally — so they can build their own future.\"",
            "te": "\"ప్రతి విద్యార్థి తన మొదటి ఈమెయిల్ నుండి, టాలీలో ఒక చిన్న వ్యాపారాన్ని నడపగలిగే వరకు — కంప్యూటర్ మీద పూర్తి ఆత్మవిశ్వాసం సాధించి, తన సొంత భవిష్యత్తును తానే నిర్మించుకోగలగాలి.\""
        }
    })

class CourseModel(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    slug: str = ""
    title_en: str
    title_te: str
    desc_en: str
    desc_te: str
    long_desc_en: str = ""
    long_desc_te: str = ""
    image_url: str = ""
    fee: str = ""
    duration: str = ""
    syllabus_en: List[str] = Field(default_factory=list)
    syllabus_te: List[str] = Field(default_factory=list)
    outcomes_en: List[str] = Field(default_factory=list)
    outcomes_te: List[str] = Field(default_factory=list)
    prerequisites_en: str = ""
    prerequisites_te: str = ""
    order: int = 0

def slugify(text: str) -> str:
    s = re.sub(r"[^a-zA-Z0-9]+", "-", (text or "").lower()).strip("-")
    return s or str(uuid.uuid4())[:8]

class AdmissionIn(BaseModel):
    student_name: str
    father_name: str
    mother_name: str
    dob: str
    gender: str
    qualification: str
    course: str
    phone: str
    alt_phone: Optional[str] = ""
    email: Optional[str] = ""
    address: str

class GalleryItem(BaseModel):
    id: str
    storage_path: str
    caption: str = ""
    created_at: str

class ChatIn(BaseModel):
    session_id: str
    message: str
    lang: str = "en"  # 'en' | 'te'

# ─────────────────────────── Seed defaults ───────────────────────────
DEFAULT_COURSES = [
    {"title_en": "Computer Basics", "title_te": "కంప్యూటర్ బేసిక్స్", "desc_en": "Learn how a computer works, files, folders, keyboard, mouse and daily-use software.", "desc_te": "కంప్యూటర్ ఎలా పని చేస్తుంది, ఫైల్స్, ఫోల్డర్స్, కీబోర్డ్, మౌస్‌తో పాటు రోజువారీ వాడకంలో ఉండే సాఫ్ట్‌వేర్ నేర్చుకోండి.", "image_url": "https://images.pexels.com/photos/10638065/pexels-photo-10638065.jpeg", "fee": "₹1,500", "duration": "1 Month"},
    {"title_en": "MS Word", "title_te": "MS వర్డ్", "desc_en": "Create documents, resumes, letters and reports with professional formatting.", "desc_te": "డాక్యుమెంట్స్, రెజ్యూమ్‌లు, లెటర్స్, రిపోర్టులు ప్రొఫెషనల్‌గా తయారు చేయడం నేర్చుకోండి.", "image_url": "https://images.unsplash.com/photo-1517842645767-c639042777db", "fee": "₹1,200", "duration": "3 Weeks"},
    {"title_en": "MS Excel", "title_te": "MS ఎక్సెల్", "desc_en": "Spreadsheets, formulas, charts and data analysis for office and small business.", "desc_te": "స్ప్రెడ్‌షీట్‌లు, ఫార్ములాలు, చార్టులు, డేటా అనాలిసిస్ — ఆఫీస్, చిన్న వ్యాపారాలకు ఉపయోగపడేది.", "image_url": "https://images.unsplash.com/photo-1551288049-bebda4e38f71", "fee": "₹1,500", "duration": "1 Month"},
    {"title_en": "MS PowerPoint", "title_te": "MS పవర్‌పాయింట్", "desc_en": "Design beautiful presentations with animations and templates.", "desc_te": "అందమైన ప్రెజెంటేషన్‌లు, యానిమేషన్‌లు, టెంప్లేట్‌లతో డిజైన్ చేయడం నేర్చుకోండి.", "image_url": "https://images.unsplash.com/photo-1611224923853-80b023f02d71", "fee": "₹1,200", "duration": "3 Weeks"},
    {"title_en": "Internet & Digital Skills", "title_te": "ఇంటర్నెట్ & డిజిటల్ స్కిల్స్", "desc_en": "Email, safe browsing, UPI payments, online forms, Google tools.", "desc_te": "ఈమెయిల్, సురక్షితమైన బ్రౌజింగ్, UPI పేమెంట్స్, ఆన్‌లైన్ ఫారంలు, గూగుల్ టూల్స్ నేర్చుకోండి.", "image_url": "https://images.pexels.com/photos/374074/pexels-photo-374074.jpeg", "fee": "₹1,000", "duration": "2 Weeks"},
    {"title_en": "Typing Skills", "title_te": "టైపింగ్ స్కిల్స్", "desc_en": "English & Telugu typing practice with speed & accuracy training.", "desc_te": "ఇంగ్లీష్ & తెలుగు టైపింగ్ ప్రాక్టీస్, స్పీడ్ & యాక్యురసీ ట్రైనింగ్.", "image_url": "https://images.pexels.com/photos/7662061/pexels-photo-7662061.jpeg", "fee": "₹800", "duration": "1 Month"},
    {"title_en": "Tally Prime", "title_te": "టాలీ ప్రైమ్", "desc_en": "Complete accounting: GST, inventory, billing and payroll for real businesses.", "desc_te": "పూర్తి అకౌంటింగ్: GST, ఇన్వెంటరీ, బిల్లింగ్, పేరోల్ — నిజమైన వ్యాపారాలకు కావలసిన స్కిల్స్.", "image_url": "https://images.unsplash.com/photo-1554224155-6726b3ff858f", "fee": "₹3,500", "duration": "2 Months"},
    {"title_en": "AI Tools", "title_te": "AI టూల్స్", "desc_en": "Learn ChatGPT, image generation, AI writing assistants and modern AI productivity tools.", "desc_te": "ChatGPT, AI ఇమేజ్ జనరేషన్, రైటింగ్ అసిస్టెంట్‌లు — ఆధునిక AI టూల్స్‌తో మీ పనిని వేగవంతం చేయండి.", "image_url": "https://images.unsplash.com/photo-1677442135703-1787eea5ce01", "fee": "₹2,500", "duration": "1 Month"},
    {"title_en": "Career Skills", "title_te": "కెరీర్ స్కిల్స్", "desc_en": "Resume building, interview practice, communication and English confidence.", "desc_te": "రెజ్యూమ్ తయారీ, ఇంటర్వ్యూ ప్రాక్టీస్, కమ్యూనికేషన్, ఇంగ్లీష్ కాన్ఫిడెన్స్ నేర్చుకోండి.", "image_url": "https://images.pexels.com/photos/6550165/pexels-photo-6550165.jpeg", "fee": "₹2,000", "duration": "1 Month"},
]

DEFAULT_WHY = [
    {"title": {"en": "Practical Training", "te": "ప్రాక్టికల్ ట్రైనింగ్"}, "desc": {"en": "Hands-on practice on real computers, real software, real problems.", "te": "నిజమైన కంప్యూటర్‌లపై, నిజమైన సాఫ్ట్‌వేర్‌లతో నేరుగా ప్రాక్టీస్ చేస్తారు."}},
    {"title": {"en": "Small Batches", "te": "చిన్న బ్యాచ్‌లు"}, "desc": {"en": "Limited students per batch so every student gets time and focus.", "te": "బ్యాచ్‌కు తక్కువ మంది విద్యార్థులు — ప్రతి ఒక్కరికీ సమయం & శ్రద్ధ లభిస్తుంది."}},
    {"title": {"en": "Individual Attention", "te": "వ్యక్తిగత శ్రద్ధ"}, "desc": {"en": "Personal guidance based on each student's speed and understanding.", "te": "ప్రతి విద్యార్థి వేగం, అవగాహన బట్టి వ్యక్తిగత గైడెన్స్."}},
    {"title": {"en": "Friendly Teaching", "te": "స్నేహపూర్వక బోధన"}, "desc": {"en": "Simple language, no fear, easy to understand for every student.", "te": "సులభమైన భాషలో, భయం లేకుండా, అందరికీ అర్థమయ్యేలా చెప్పే బోధన."}},
    {"title": {"en": "Affordable Fees", "te": "అందుబాటు ఫీజులు"}, "desc": {"en": "Quality training at fees any family can afford.", "te": "ఏ కుటుంబమైనా భరించగలిగే ఫీజులతో నాణ్యమైన ట్రైనింగ్."}},
    {"title": {"en": "Career Guidance", "te": "కెరీర్ మార్గదర్శకత్వం"}, "desc": {"en": "Resume, interview and job-search support after your course.", "te": "కోర్సు తర్వాత రెజ్యూమ్, ఇంటర్వ్యూ, ఉద్యోగ శోధన సహాయం."}},
]

DEFAULT_TESTIMONIALS = [
    {
        "name": "Sravani Devi",
        "role": {"en": "Student, MS Excel", "te": "విద్యార్థి, MS ఎక్సెల్"},
        "message": {
            "en": "Before joining NextGen, I had never used a computer. Now I can prepare Excel reports and even help my father in his shop. The teachers explain everything in Telugu when I get stuck — that made all the difference.",
            "te": "నెక్స్ట్‌జెన్‌లో చేరకముందు నేను ఎప్పుడూ కంప్యూటర్ ముట్టుకోలేదు. ఇప్పుడు నేను ఎక్సెల్ రిపోర్ట్‌లు తయారు చేయగలుగుతున్నాను, మా నాన్నకి షాప్ లెక్కల్లో సాయం చేస్తున్నాను. అర్థం కానప్పుడు తెలుగులో చెప్పడమే పెద్ద తేడా."
        },
        "rating": 5,
        "photo_url": "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg",
        "published": True,
    },
    {
        "name": "Rajesh Kumar",
        "role": {"en": "Tally Prime Graduate", "te": "టాలీ ప్రైమ్ గ్రాడ్యుయేట్"},
        "message": {
            "en": "The Tally Prime course was 100% practical. Within 2 months, I got a billing operator job at a local wholesale shop. Praveen sir helped me with my resume and interview prep too.",
            "te": "టాలీ ప్రైమ్ కోర్సు పూర్తిగా ప్రాక్టికల్‌గా ఉంది. 2 నెలల్లోనే మా ఏరియా హోల్‌సేల్ షాప్‌లో బిల్లింగ్ ఆపరేటర్ ఉద్యోగం వచ్చింది. ప్రవీణ్ సర్ రెజ్యూమ్‌తో, ఇంటర్వ్యూ ప్రాక్టీస్‌తో కూడా సాయం చేశారు."
        },
        "rating": 5,
        "photo_url": "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg",
        "published": True,
    },
    {
        "name": "Anitha Reddy",
        "role": {"en": "Housewife → Freelancer", "te": "గృహిణి → ఫ్రీలాన్సర్"},
        "message": {
            "en": "I started with the AI Tools course out of curiosity. Now I use ChatGPT and image tools to earn small freelance projects from home. Never thought I could do this at 38!",
            "te": "కుతూహలంతో AI టూల్స్ కోర్సు మొదలుపెట్టాను. ఇప్పుడు ChatGPT, ఇమేజ్ టూల్స్‌తో ఇంటి నుండే చిన్న ఫ్రీలాన్స్ ప్రాజెక్ట్‌లు చేసుకుంటున్నాను. 38 ఏళ్లకి ఇది సాధ్యం అని అనుకోలేదు!"
        },
        "rating": 5,
        "photo_url": "https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg",
        "published": True,
    },
    {
        "name": "Venkatesh N.",
        "role": {"en": "Intermediate Student", "te": "ఇంటర్ విద్యార్థి"},
        "message": {
            "en": "Small batch size means the teacher actually knows my name and my speed. I was slow at typing but improved to 35 WPM in one month.",
            "te": "చిన్న బ్యాచ్ కాబట్టి సర్‌కి నా పేరు, నా వేగం రెండూ తెలుసు. టైపింగ్‌లో నేను చాలా స్లోగా ఉండేవాడ్ని — ఒక నెలలో 35 WPM చేరుకున్నా."
        },
        "rating": 4,
        "photo_url": "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg",
        "published": True,
    },
]

async def seed_defaults():
    # Admin
    existing = await db.admin_users.find_one({"email": ADMIN_EMAIL})
    if not existing:
        pw_hash = bcrypt.hashpw(ADMIN_PASSWORD.encode(), bcrypt.gensalt()).decode()
        await db.admin_users.insert_one({"email": ADMIN_EMAIL, "password_hash": pw_hash, "created_at": datetime.now(timezone.utc).isoformat()})
        logger.info(f"Seeded admin: {ADMIN_EMAIL}")
    # Content
    if not await db.site_content.find_one({"_id": "singleton"}):
        c = SiteContent().model_dump()
        c["_id"] = "singleton"
        c["why_choose_us"] = DEFAULT_WHY
        await db.site_content.insert_one(c)
        logger.info("Seeded default site content")
    else:
        # Backfill trainer field for existing installs
        existing_content = await db.site_content.find_one({"_id": "singleton"})
        if existing_content and not existing_content.get("trainer"):
            default_trainer = SiteContent().model_dump().get("trainer")
            await db.site_content.update_one({"_id": "singleton"}, {"$set": {"trainer": default_trainer}})
            logger.info("Backfilled trainer defaults")
    # Courses
    if await db.courses.count_documents({}) == 0:
        for i, c in enumerate(DEFAULT_COURSES):
            doc = {**c, "id": str(uuid.uuid4()), "order": i, "slug": slugify(c["title_en"])}
            await db.courses.insert_one(doc)
        logger.info("Seeded default courses")
    else:
        # Backfill slugs for existing courses that don't have one
        async for course in db.courses.find({"$or": [{"slug": {"$exists": False}}, {"slug": ""}]}):
            slug = slugify(course.get("title_en", ""))
            await db.courses.update_one({"id": course["id"]}, {"$set": {"slug": slug}})
    # Testimonials
    if await db.testimonials.count_documents({}) == 0:
        for i, t in enumerate(DEFAULT_TESTIMONIALS):
            await db.testimonials.insert_one({**t, "id": str(uuid.uuid4()), "order": i, "created_at": datetime.now(timezone.utc).isoformat()})
        logger.info("Seeded default testimonials")

# ─────────────────────────── Notifications (channel-based) ───────────────────────────
# Provider registry — add new channels here in the future (e.g. WhatsApp Cloud API)
# without touching the admission handler. Each channel is a plain async function
# (recipient: str, subject: str, html: str) -> None that gracefully no-ops
# when its API key is not configured.

async def _channel_email(recipient: str, subject: str, html: str) -> None:
    await send_email_async(recipient, subject, html)

async def _channel_whatsapp(recipient: str, subject: str, html: str) -> None:
    """Placeholder — WhatsApp Cloud API integration goes here.
    Reads WHATSAPP_ACCESS_TOKEN / WHATSAPP_PHONE_ID from env when ready.
    Currently disabled: no-ops silently so enabling it later requires zero
    changes to the admission flow."""
    if not os.environ.get("WHATSAPP_ACCESS_TOKEN"):
        return
    logger.info("WhatsApp channel: recipient=%s subject=%s (impl deferred)", recipient, subject)

NOTIFICATION_CHANNELS = {
    "email": {
        "send": _channel_email,
        "recipient_key": "owner_notification_email",
        "provider_configured": lambda: email_enabled(),
    },
    "whatsapp": {
        "send": _channel_whatsapp,
        "recipient_key": "owner_notification_whatsapp",
        "provider_configured": lambda: bool(os.environ.get("WHATSAPP_ACCESS_TOKEN")),
    },
}

async def dispatch_admission_notification(admission: Dict[str, Any]) -> None:
    """Fire-and-forget dispatch across every enabled channel. Never raises."""
    try:
        cfg = await db.site_content.find_one({"_id": "singleton"}) or {}
        if not cfg.get("notifications_enabled", True):
            return
        subject = f"New Admission — {admission.get('student_name')} ({admission.get('course')})"
        html = _admission_email_html(admission)
        enabled_channels = cfg.get("enabled_notification_channels") or ["email"]
        for name in enabled_channels:
            ch = NOTIFICATION_CHANNELS.get(name)
            if not ch:
                continue
            to = (cfg.get(ch["recipient_key"]) or "").strip()
            if not to:
                continue
            asyncio.create_task(ch["send"](to, subject, html))
    except Exception as e:
        logger.error("dispatch_admission_notification failed: %s", e)

def _admission_email_html(a: Dict[str, Any]) -> str:
    return f"""
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#0A2342;color:#fff;padding:20px 24px;border-radius:12px 12px 0 0">
        <h2 style="margin:0;font-family:Arial,sans-serif">New Admission Received</h2>
        <p style="margin:6px 0 0;color:#C9A227;font-size:12px;letter-spacing:2px">NEXTGEN COMPUTER ACADEMY</p>
      </div>
      <div style="background:#fff;border:1px solid #eee;border-top:0;padding:24px;border-radius:0 0 12px 12px">
        <table style="width:100%;font-size:14px;color:#1E293B;border-collapse:collapse">
          <tr><td style="padding:6px 0;color:#475569;width:160px">Student Name</td><td style="padding:6px 0;font-weight:600">{a.get('student_name','')}</td></tr>
          <tr><td style="padding:6px 0;color:#475569">Father / Mother</td><td style="padding:6px 0">{a.get('father_name','')} / {a.get('mother_name','')}</td></tr>
          <tr><td style="padding:6px 0;color:#475569">Date of Birth</td><td style="padding:6px 0">{a.get('dob','')}</td></tr>
          <tr><td style="padding:6px 0;color:#475569">Gender</td><td style="padding:6px 0">{a.get('gender','')}</td></tr>
          <tr><td style="padding:6px 0;color:#475569">Qualification</td><td style="padding:6px 0">{a.get('qualification','')}</td></tr>
          <tr><td style="padding:6px 0;color:#475569">Course</td><td style="padding:6px 0;font-weight:600;color:#0A2342">{a.get('course','')}</td></tr>
          <tr><td style="padding:6px 0;color:#475569">Phone</td><td style="padding:6px 0">{a.get('phone','')}{(' / ' + a.get('alt_phone','')) if a.get('alt_phone') else ''}</td></tr>
          <tr><td style="padding:6px 0;color:#475569">Email</td><td style="padding:6px 0">{a.get('email','') or '—'}</td></tr>
          <tr><td style="padding:6px 0;color:#475569;vertical-align:top">Address</td><td style="padding:6px 0">{a.get('address','')}</td></tr>
        </table>
        <p style="margin:20px 0 0;font-size:12px;color:#64748b">Received at {a.get('created_at','')}. Open the admin panel to view the student photo.</p>
      </div>
    </div>
    """

# ─────────────────────────── Routes ───────────────────────────
@api_router.get("/")
async def root():
    return {"ok": True, "service": "NextGen Computer Academy"}

@api_router.post("/auth/login")
async def login(body: LoginIn):
    user = await db.admin_users.find_one({"email": body.email.lower()})
    if not user or not bcrypt.checkpw(body.password.encode(), user["password_hash"].encode()):
        raise HTTPException(401, "Invalid credentials")
    return {"token": create_token(body.email.lower()), "email": body.email.lower()}

@api_router.get("/auth/me")
async def me(email: str = Depends(require_admin)):
    return {"email": email}

@api_router.get("/notifications/status")
async def notifications_status(_: str = Depends(require_admin)):
    cfg = await db.site_content.find_one({"_id": "singleton"}) or {}
    return {
        "email_provider_configured": email_enabled(),
        "sender_email": SENDER_EMAIL if email_enabled() else None,
        "owner_notification_email": (cfg.get("owner_notification_email") or ""),
        "notifications_enabled": cfg.get("notifications_enabled", True),
    }

@api_router.post("/notifications/test")
async def notifications_test(_: str = Depends(require_admin)):
    cfg = await db.site_content.find_one({"_id": "singleton"}) or {}
    to_email = (cfg.get("owner_notification_email") or "").strip()
    if not email_enabled():
        raise HTTPException(400, "Email provider not configured. Set RESEND_API_KEY in backend .env")
    if not to_email:
        raise HTTPException(400, "No owner_notification_email set. Configure it in the admin panel.")
    html = "<p>This is a test notification from <b>NextGen Computer Academy</b>. If you received this, your admission alerts are working. ✅</p>"
    await send_email_async(to_email, "Test — NextGen Admission Notifications", html)
    return {"ok": True, "sent_to": to_email}

# Content
def _clean(doc):
    if not doc:
        return doc
    doc.pop("_id", None)
    return doc

@api_router.get("/content")
async def get_content():
    doc = await db.site_content.find_one({"_id": "singleton"})
    return _clean(doc) or {}

@api_router.put("/content")
async def update_content(body: Dict[str, Any], _: str = Depends(require_admin)):
    body.pop("_id", None)
    await db.site_content.update_one({"_id": "singleton"}, {"$set": body}, upsert=True)
    doc = await db.site_content.find_one({"_id": "singleton"})
    return _clean(doc)

# Courses
@api_router.get("/courses")
async def list_courses():
    items = await db.courses.find({}, {"_id": 0}).sort("order", 1).to_list(200)
    return items

@api_router.get("/courses/{key}")
async def get_course(key: str):
    doc = await db.courses.find_one({"$or": [{"id": key}, {"slug": key}]}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Course not found")
    return doc

@api_router.post("/courses")
async def create_course(c: CourseModel, _: str = Depends(require_admin)):
    doc = c.model_dump()
    if not doc.get("slug"):
        doc["slug"] = slugify(doc.get("title_en", ""))
    if await db.courses.find_one({"slug": doc["slug"]}):
        doc["slug"] = f"{doc['slug']}-{doc['id'][:6]}"
    await db.courses.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api_router.put("/courses/{cid}")
async def update_course(cid: str, body: Dict[str, Any], _: str = Depends(require_admin)):
    body.pop("_id", None); body.pop("id", None)
    if "slug" in body and not body["slug"]:
        body["slug"] = slugify(body.get("title_en", "") or "")
    await db.courses.update_one({"id": cid}, {"$set": body})
    doc = await db.courses.find_one({"id": cid}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Not found")
    return doc

@api_router.delete("/courses/{cid}")
async def delete_course(cid: str, _: str = Depends(require_admin)):
    await db.courses.delete_one({"id": cid})
    return {"ok": True}

# Admissions
@api_router.post("/admissions")
async def create_admission(
    student_name: str = Form(...), father_name: str = Form(...), mother_name: str = Form(...),
    dob: str = Form(...), gender: str = Form(...), qualification: str = Form(...),
    course: str = Form(...), phone: str = Form(...), alt_phone: str = Form(""),
    email: str = Form(""), address: str = Form(...),
    photo: Optional[UploadFile] = File(None)
):
    aid = str(uuid.uuid4())
    photo_path = None
    if photo and photo.filename:
        ext = photo.filename.rsplit(".", 1)[-1].lower() if "." in photo.filename else "jpg"
        photo_path = f"{APP_NAME}/admissions/{aid}.{ext}"
        data = await photo.read()
        put_object(photo_path, data, photo.content_type or "image/jpeg")
    doc = {
        "id": aid, "student_name": student_name, "father_name": father_name, "mother_name": mother_name,
        "dob": dob, "gender": gender, "qualification": qualification, "course": course,
        "phone": phone, "alt_phone": alt_phone, "email": email, "address": address,
        "photo_path": photo_path, "created_at": datetime.now(timezone.utc).isoformat(),
        "status": "new"
    }
    await db.admissions.insert_one(doc)
    # Multi-channel fire-and-forget notification (email now, WhatsApp-ready)
    await dispatch_admission_notification(doc)
    return {"ok": True, "id": aid, "message": "Admission received"}

@api_router.get("/admissions")
async def list_admissions(_: str = Depends(require_admin)):
    items = await db.admissions.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return items

@api_router.delete("/admissions/{aid}")
async def delete_admission(aid: str, _: str = Depends(require_admin)):
    await db.admissions.delete_one({"id": aid})
    return {"ok": True}

@api_router.get("/admissions/{aid}/photo")
async def get_admission_photo(aid: str, authorization: Optional[str] = Header(None), auth: Optional[str] = Query(None)):
    verify_token(authorization, auth)
    rec = await db.admissions.find_one({"id": aid})
    if not rec or not rec.get("photo_path"):
        raise HTTPException(404, "No photo")
    data, ct = get_object(rec["photo_path"])
    return Response(content=data, media_type=ct)

# Gallery
@api_router.get("/gallery")
async def list_gallery():
    items = await db.gallery.find({"is_deleted": {"$ne": True}}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return items

@api_router.post("/gallery")
async def upload_gallery(caption: str = Form(""), file: UploadFile = File(...), _: str = Depends(require_admin)):
    gid = str(uuid.uuid4())
    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else "jpg"
    path = f"{APP_NAME}/gallery/{gid}.{ext}"
    data = await file.read()
    put_object(path, data, file.content_type or "image/jpeg")
    doc = {"id": gid, "storage_path": path, "caption": caption, "content_type": file.content_type,
           "is_deleted": False, "created_at": datetime.now(timezone.utc).isoformat()}
    await db.gallery.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api_router.get("/gallery/{gid}/image")
async def get_gallery_image(gid: str):
    rec = await db.gallery.find_one({"id": gid, "is_deleted": {"$ne": True}})
    if not rec:
        raise HTTPException(404, "Not found")
    data, ct = get_object(rec["storage_path"])
    return Response(content=data, media_type=rec.get("content_type") or ct)

@api_router.delete("/gallery/{gid}")
async def delete_gallery(gid: str, _: str = Depends(require_admin)):
    await db.gallery.update_one({"id": gid}, {"$set": {"is_deleted": True}})
    return {"ok": True}

# ─────────────────────────── Testimonials ───────────────────────────
class TestimonialModel(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    role: Dict[str, str] = Field(default_factory=lambda: {"en": "", "te": ""})
    message: Dict[str, str] = Field(default_factory=lambda: {"en": "", "te": ""})
    rating: int = 5
    photo_url: str = ""
    published: bool = True
    order: int = 0

@api_router.get("/testimonials")
async def list_testimonials():
    items = await db.testimonials.find({"published": True}, {"_id": 0}).sort("order", 1).to_list(200)
    return items

@api_router.get("/admin/testimonials")
async def admin_list_testimonials(_: str = Depends(require_admin)):
    items = await db.testimonials.find({}, {"_id": 0}).sort("order", 1).to_list(500)
    return items

@api_router.post("/testimonials")
async def create_testimonial(t: TestimonialModel, _: str = Depends(require_admin)):
    doc = t.model_dump()
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.testimonials.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api_router.put("/testimonials/{tid}")
async def update_testimonial(tid: str, body: Dict[str, Any], _: str = Depends(require_admin)):
    body.pop("_id", None); body.pop("id", None)
    await db.testimonials.update_one({"id": tid}, {"$set": body})
    doc = await db.testimonials.find_one({"id": tid}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Not found")
    return doc

@api_router.delete("/testimonials/{tid}")
async def delete_testimonial(tid: str, _: str = Depends(require_admin)):
    await db.testimonials.delete_one({"id": tid})
    return {"ok": True}

# ─────────────────────────── Bulk export ───────────────────────────
EXPORT_COLUMNS = [
    ("created_at", "Received At"),
    ("student_name", "Student Name"),
    ("father_name", "Father Name"),
    ("mother_name", "Mother Name"),
    ("dob", "Date of Birth"),
    ("gender", "Gender"),
    ("qualification", "Qualification"),
    ("course", "Course"),
    ("phone", "Phone"),
    ("alt_phone", "Alt Phone"),
    ("email", "Email"),
    ("address", "Address"),
    ("status", "Status"),
    ("id", "Admission ID"),
]

@api_router.get("/admissions/export/csv")
async def export_admissions_csv(authorization: Optional[str] = Header(None), auth: Optional[str] = Query(None)):
    verify_token(authorization, auth)
    items = await db.admissions.find({}, {"_id": 0}).sort("created_at", -1).to_list(10000)
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow([label for _, label in EXPORT_COLUMNS])
    for it in items:
        writer.writerow([str(it.get(k, "") or "") for k, _ in EXPORT_COLUMNS])
    csv_bytes = buf.getvalue().encode("utf-8-sig")  # BOM so Excel opens Telugu correctly
    fname = f"admissions-{datetime.now(timezone.utc).strftime('%Y%m%d-%H%M%S')}.csv"
    return Response(content=csv_bytes, media_type="text/csv",
                    headers={"Content-Disposition": f'attachment; filename="{fname}"'})

@api_router.get("/admissions/export/xlsx")
async def export_admissions_xlsx(authorization: Optional[str] = Header(None), auth: Optional[str] = Query(None)):
    verify_token(authorization, auth)
    items = await db.admissions.find({}, {"_id": 0}).sort("created_at", -1).to_list(10000)
    wb = Workbook()
    ws = wb.active
    ws.title = "Admissions"
    ws.append([label for _, label in EXPORT_COLUMNS])
    for it in items:
        ws.append([str(it.get(k, "") or "") for k, _ in EXPORT_COLUMNS])
    # column widths
    for i, (_, label) in enumerate(EXPORT_COLUMNS, start=1):
        ws.column_dimensions[ws.cell(row=1, column=i).column_letter].width = max(14, len(label) + 4)
    out = io.BytesIO()
    wb.save(out)
    out.seek(0)
    fname = f"admissions-{datetime.now(timezone.utc).strftime('%Y%m%d-%H%M%S')}.xlsx"
    return Response(content=out.read(),
                    media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    headers={"Content-Disposition": f'attachment; filename="{fname}"'})

# ─────────────────────────── SEO — sitemap & robots ───────────────────────────
def _resolve_site_url(cfg: Dict[str, Any]) -> str:
    seo = (cfg or {}).get("seo") or {}
    return (seo.get("canonical_url") or os.environ.get("PUBLIC_SITE_URL") or "").rstrip("/")

@api_router.get("/sitemap.xml")
async def sitemap_xml():
    cfg = await db.site_content.find_one({"_id": "singleton"}) or {}
    base = _resolve_site_url(cfg) or ""
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    urls = [
        (f"{base}/", "1.0"),
        (f"{base}/#about", "0.8"),
        (f"{base}/#courses", "0.9"),
        (f"{base}/#trainer", "0.7"),
        (f"{base}/#gallery", "0.6"),
        (f"{base}/#admission", "0.9"),
        (f"{base}/#contact", "0.7"),
    ]
    courses = await db.courses.find({}, {"_id": 0, "slug": 1, "id": 1}).to_list(200)
    for c in courses:
        slug = c.get("slug") or c.get("id")
        urls.append((f"{base}/course/{slug}", "0.7"))
    body = ['<?xml version="1.0" encoding="UTF-8"?>',
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for loc, prio in urls:
        body.append(f"  <url><loc>{loc}</loc><lastmod>{now}</lastmod><changefreq>weekly</changefreq><priority>{prio}</priority></url>")
    body.append("</urlset>")
    return Response(content="\n".join(body), media_type="application/xml")

@api_router.get("/robots.txt")
async def robots_txt():
    cfg = await db.site_content.find_one({"_id": "singleton"}) or {}
    base = _resolve_site_url(cfg) or ""
    lines = [
        "User-agent: *",
        "Allow: /",
        "Disallow: /admin",
        "Disallow: /admin/",
        f"Sitemap: {base}/api/sitemap.xml" if base else "Sitemap: /api/sitemap.xml",
    ]
    return Response(content="\n".join(lines), media_type="text/plain")

# Chat
@api_router.post("/chat")
async def chat(body: ChatIn):
    content = await db.site_content.find_one({"_id": "singleton"}) or {}
    courses = await db.courses.find({}, {"_id": 0}).to_list(50)
    contact = content.get("contact", {})

    course_summary = "\n".join([f"- {c['title_en']} / {c['title_te']} — Fee: {c.get('fee','')}, Duration: {c.get('duration','')}" for c in courses])
    lang_hint = "Reply in easy Telugu (simple spoken style, avoid bookish Telugu)." if body.lang == "te" else "Reply in simple English. If the user writes in Telugu, reply in Telugu."

    system = f"""You are 'NextGen AI Assistant' for NextGen Computer Academy — a friendly bilingual (English + simple spoken Telugu) helper.
Always be warm, short, encouraging. Use bullet points where useful.

{lang_hint}

Academy info:
- Name: {content.get('academy_name',{}).get('en','NextGen Computer Academy')}
- Tagline: Learn Today. Lead Tomorrow.
- Phone: {contact.get('phone','')}
- WhatsApp: {contact.get('whatsapp','')}
- Email: {contact.get('email','')}
- Address: {contact.get('address_en','')}
- Timings: {contact.get('timings_en','')}

Courses & Fees:
{course_summary}

Rules:
- Only answer questions about the academy, courses, fees, admissions, timings, computer topics, or careers.
- If user asks unrelated things, politely redirect them.
- Never invent phone numbers or fees not in the info above.
- Keep answers under 120 words unless the user asks for detail.
"""

    async def gen():
        try:
            chat_client = LlmChat(
                api_key=EMERGENT_LLM_KEY,
                session_id=body.session_id,
                system_message=system,
            ).with_model("anthropic", "claude-sonnet-4-6")
            async for ev in chat_client.stream_message(UserMessage(text=body.message)):
                if isinstance(ev, TextDelta):
                    yield ev.content
                elif isinstance(ev, StreamDone):
                    break
        except Exception as e:
            logger.exception("chat error")
            yield f"\n[Assistant error: {str(e)}]"

    return StreamingResponse(gen(), media_type="text/plain", headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})

# Register
app.include_router(api_router)
app.add_middleware(CORSMiddleware, allow_credentials=True,
                   allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
                   allow_methods=["*"], allow_headers=["*"])

@app.on_event("startup")
async def _startup():
    init_storage()
    await seed_defaults()

@app.on_event("shutdown")
async def _shutdown():
    client.close()
