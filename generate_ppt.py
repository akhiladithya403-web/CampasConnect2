import os
import sys
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def create_presentation():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]  # blank slide

    # Color Palette
    DARK_BG = RGBColor(11, 19, 43)        # #0B132B Deep Navy
    DARK_CARD = RGBColor(20, 32, 60)      # #14203C Card on dark
    
    LIGHT_BG = RGBColor(246, 248, 252)    # #F6F8FC Modern Soft Gray/White
    CARD_BG = RGBColor(255, 255, 255)     # #FFFFFF White
    CARD_BORDER = RGBColor(226, 232, 240) # #E2E8F0 Soft Border
    
    NAVY = RGBColor(15, 23, 42)           # #0F172A Dark Slate / Navy
    BLUE = RGBColor(37, 99, 235)          # #2563EB Royal / Electric Blue
    CYAN = RGBColor(6, 182, 212)          # #06B6D4 Cyan Accent
    CYAN_GLOW = RGBColor(56, 189, 248)    # #38BDF8 Light Cyan
    EMERALD = RGBColor(16, 185, 129)      # #10B981 Green
    AMBER = RGBColor(245, 158, 11)        # #F59E0B Amber
    PURPLE = RGBColor(139, 92, 246)       # #8B5CF6 Purple
    
    TEXT_MUTED = RGBColor(100, 116, 139)  # #64748B
    TEXT_BODY = RGBColor(51, 65, 85)      # #334155
    WHITE = RGBColor(255, 255, 255)
    
    FONT_MAIN = "Segoe UI"

    def add_shape(slide, shape_type, left, top, width, height, fill_color, border_color=None, border_width=1):
        shape = slide.shapes.add_shape(shape_type, left, top, width, height)
        shape.fill.solid()
        shape.fill.fore_color.rgb = fill_color
        if border_color:
            shape.line.color.rgb = border_color
            shape.line.width = Pt(border_width)
        else:
            shape.line.fill.background()
        return shape

    def add_textbox(slide, left, top, width, height, text="", font_size=14, font_bold=False, font_color=NAVY, align=PP_ALIGN.LEFT):
        tb = slide.shapes.add_textbox(left, top, width, height)
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = Inches(0.05)
        tf.margin_right = Inches(0.05)
        tf.margin_top = Inches(0.05)
        tf.margin_bottom = Inches(0.05)
        p = tf.paragraphs[0]
        p.text = text
        p.font.name = FONT_MAIN
        p.font.size = Pt(font_size)
        p.font.bold = font_bold
        p.font.color.rgb = font_color
        p.alignment = align
        return tb, tf, p

    # ==========================================
    # SLIDE 1: Title Slide (Creative Dark Theme)
    # ==========================================
    s1 = prs.slides.add_slide(blank_layout)
    # Background
    add_shape(s1, MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5), DARK_BG)
    
    # Glowing top accent band
    add_shape(s1, MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(0.12), CYAN)

    # College Name Pill / Badge
    clg_pill = add_shape(s1, MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.0), Inches(0.8), Inches(7.2), Inches(0.48), RGBColor(18, 38, 77), CYAN, 1.2)
    _, _, p = add_textbox(s1, Inches(1.1), Inches(0.85), Inches(7.0), Inches(0.4), 
                          "🏛️  SRI INDU COLLEGE OF ENGINEERING AND TECHNOLOGY", 13, True, CYAN_GLOW, PP_ALIGN.CENTER)

    # College Affiliation note
    _, _, _ = add_textbox(s1, Inches(1.0), Inches(1.35), Inches(9.0), Inches(0.3),
                          "UGC Autonomous Institution • Affiliated to JNTUH • Accredited by NAAC & NBA • Hyderabad", 11, False, RGBColor(148, 163, 184))

    # Project Title
    _, tf, p = add_textbox(s1, Inches(1.0), Inches(1.85), Inches(11.0), Inches(1.25),
                           "CampusConnect AI", 52, True, WHITE)
    
    # Tagline / Subtitle
    _, tf, p = add_textbox(s1, Inches(1.0), Inches(3.05), Inches(11.0), Inches(0.6),
                           "Next-Gen Smart Campus Life Ecosystem with Roll No Authentication & Automated Services", 19, False, CYAN_GLOW)

    # Feature Highlights Badges in Row
    domains = [
        ("🔍 Smart Lost & Found", RGBColor(14, 116, 144)),
        ("☕ Wait-Free Canteen", RGBColor(180, 83, 9)),
        ("🎙️ Voice Navigation", RGBColor(30, 64, 175)),
        ("🏆 Events & Sports", RGBColor(4, 120, 87)),
        ("📢 Campus Grievance", RGBColor(136, 19, 55))
    ]
    badge_w = Inches(2.15)
    badge_gap = Inches(0.14)
    start_x = Inches(1.0)
    for i, (dom, col) in enumerate(domains):
        bx = start_x + i * (badge_w + badge_gap)
        add_shape(s1, MSO_SHAPE.ROUNDED_RECTANGLE, bx, Inches(3.8), badge_w, Inches(0.42), col, None)
        add_textbox(s1, bx, Inches(3.85), badge_w, Inches(0.35), dom, 11, True, WHITE, PP_ALIGN.CENTER)

    # Bottom Presenter & Team Card
    t_card = add_shape(s1, MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.0), Inches(4.6), Inches(11.333), Inches(2.2), DARK_CARD, RGBColor(30, 58, 110), 1.5)
    
    # Left column: Team & Presenter
    add_textbox(s1, Inches(1.4), Inches(4.8), Inches(5.0), Inches(0.35), "PROJECT PRESENTATION BY:", 11, True, CYAN_GLOW)
    add_textbox(s1, Inches(1.4), Inches(5.15), Inches(5.0), Inches(0.45), "Team CampusConnect AI", 22, True, WHITE)
    add_textbox(s1, Inches(1.4), Inches(5.65), Inches(5.0), Inches(0.35), "Department of Computer Science & Engineering", 13, False, RGBColor(203, 213, 225))
    add_textbox(s1, Inches(1.4), Inches(6.0), Inches(5.0), Inches(0.3), "Sri Indu College of Engineering and Technology", 12, False, RGBColor(148, 163, 184))
    add_textbox(s1, Inches(1.4), Inches(6.3), Inches(5.0), Inches(0.3), "Academic Year 2026 - 2027 • Final Review", 11, False, RGBColor(148, 163, 184))

    # Right column: Core Highlights
    add_textbox(s1, Inches(7.0), Inches(4.8), Inches(5.0), Inches(0.35), "KEY SYSTEM HIGHLIGHTS:", 11, True, CYAN_GLOW)
    add_textbox(s1, Inches(7.0), Inches(5.15), Inches(5.0), Inches(0.3), "✔ Roll Number Direct Login (e.g. 22CS108)", 12, False, WHITE)
    add_textbox(s1, Inches(7.0), Inches(5.45), Inches(5.0), Inches(0.3), "✔ 5 Autonomous Student Life Operational Modules", 12, False, WHITE)
    add_textbox(s1, Inches(7.0), Inches(5.75), Inches(5.0), Inches(0.3), "✔ Automated Email Dispatch & Instant Token Chimes", 12, False, WHITE)
    add_textbox(s1, Inches(7.0), Inches(6.05), Inches(5.0), Inches(0.3), "✔ Web Speech Navigation & Multimedia Grievances", 12, False, WHITE)
    add_textbox(s1, Inches(7.0), Inches(6.35), Inches(5.0), Inches(0.3), "✔ Zero Framework Overhead: Pure HTML, CSS, JS & Java", 12, False, CYAN_GLOW)

    # Helper function for Content Slide Header & Footer
    def add_slide_decorations(slide, category_text, title_text, subtitle_text, slide_num):
        # Light Background
        add_shape(slide, MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5), LIGHT_BG)
        # Top Accent Line
        add_shape(slide, MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(0.08), BLUE)
        
        # Category Pill
        pill = add_shape(slide, MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.9), Inches(0.38), Inches(4.0), Inches(0.34), RGBColor(239, 246, 255), BLUE, 1)
        add_textbox(slide, Inches(0.9), Inches(0.41), Inches(4.0), Inches(0.3), category_text, 10, True, BLUE, PP_ALIGN.CENTER)
        
        # Title
        add_textbox(slide, Inches(0.9), Inches(0.78), Inches(11.5), Inches(0.55), title_text, 25, True, NAVY)
        # Subtitle
        add_textbox(slide, Inches(0.9), Inches(1.36), Inches(11.5), Inches(0.35), subtitle_text, 13, False, TEXT_MUTED)
        
        # Footer
        add_shape(slide, MSO_SHAPE.RECTANGLE, Inches(0.9), Inches(6.95), Inches(11.533), Inches(0.02), RGBColor(226, 232, 240))
        add_textbox(slide, Inches(0.9), Inches(7.02), Inches(9.0), Inches(0.3), 
                    "CampusConnect AI • Sri Indu College of Engineering and Technology (CSE Dept)", 10, False, TEXT_MUTED)
        add_textbox(slide, Inches(11.2), Inches(7.02), Inches(1.2), Inches(0.3), 
                    f"Slide {slide_num} of 8", 10, True, BLUE, PP_ALIGN.RIGHT)

    # ==========================================
    # SLIDE 2: Project Overview & Problem Statement
    # ==========================================
    s2 = prs.slides.add_slide(blank_layout)
    add_slide_decorations(s2, "EXECUTIVE SUMMARY & PROBLEM STATEMENT", "Project Overview: Transforming Campus Life", 
                          "Bridging campus fragmentation through a unified, AI-assisted student digital gateway", 2)

    card_w = Inches(3.64)
    card_h = Inches(4.35)
    card_y = Inches(1.82)

    # Card 1: The Friction / Problems
    c1 = add_shape(s2, MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.9), card_y, card_w, card_h, CARD_BG, RGBColor(254, 202, 202), 1.5)
    add_shape(s2, MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.15), Inches(2.02), Inches(2.4), Inches(0.35), RGBColor(254, 242, 242), RGBColor(239, 68, 68), 1)
    add_textbox(s2, Inches(1.15), Inches(2.07), Inches(2.4), Inches(0.3), "⚠️ The Challenges", 11, True, RGBColor(185, 28, 28), PP_ALIGN.CENTER)
    
    probs = [
        "• Long Canteen Queues: 20-30 min wait times consume short lunch breaks.",
        "• Lost Belongings: Lost items rarely reach rightful owners due to notice board delays.",
        "• Campus Wayfinding: New students and visitors struggle across expansive multi-block layout.",
        "• Manual Grievances: Paper complaints get buried without tracking or photo proof.",
        "• Event Friction: Crowded registration desks and lost physical paper tickets."
    ]
    py = Inches(2.55)
    for p_text in probs:
        add_textbox(s2, Inches(1.15), py, Inches(3.14), Inches(0.55), p_text, 11, False, TEXT_BODY)
        py += Inches(0.68)

    # Card 2: The CampusConnect AI Solution
    c2 = add_shape(s2, MSO_SHAPE.ROUNDED_RECTANGLE, Inches(4.84), card_y, card_w, card_h, CARD_BG, RGBColor(191, 219, 254), 1.5)
    add_shape(s2, MSO_SHAPE.ROUNDED_RECTANGLE, Inches(5.09), Inches(2.02), Inches(2.7), Inches(0.35), RGBColor(239, 246, 255), BLUE, 1)
    add_textbox(s2, Inches(5.09), Inches(2.07), Inches(2.7), Inches(0.3), "💡 The Smart Solution", 11, True, BLUE, PP_ALIGN.CENTER)
    
    sols = [
        "• Single Roll No ID: Direct authentication (e.g., 22CS108) with auto-filled credentials.",
        "• Digital Tokens: Queue-free food ordering with live kitchen status and chime alerts.",
        "• AI Matching: Media-enabled lost & found matching with instant auto-email dispatch.",
        "• Spoken Navigation: Web Speech API voice guidance for rooms, labs, and exam cell.",
        "• Transparent Redressal: Photo/video grievance submission with community upvoting."
    ]
    sy = Inches(2.55)
    for s_text in sols:
        add_textbox(s2, Inches(5.09), sy, Inches(3.14), Inches(0.55), s_text, 11, False, TEXT_BODY)
        sy += Inches(0.68)

    # Card 3: Key Value & Innovations
    c3 = add_shape(s2, MSO_SHAPE.ROUNDED_RECTANGLE, Inches(8.78), card_y, card_w, card_h, CARD_BG, RGBColor(167, 243, 208), 1.5)
    add_shape(s2, MSO_SHAPE.ROUNDED_RECTANGLE, Inches(9.03), Inches(2.02), Inches(2.7), Inches(0.35), RGBColor(236, 253, 245), EMERALD, 1)
    add_textbox(s2, Inches(9.03), Inches(2.07), Inches(2.7), Inches(0.3), "🚀 Impact & Highlights", 11, True, RGBColor(4, 120, 87), PP_ALIGN.CENTER)
    
    vals = [
        "• 100% Zero-Wait Dining: Pick up food right when called; zero counter crowding.",
        "• Automated Email Engine: Digital passes, receipts, and alert dispatches in milliseconds.",
        "• Voice Accessibility: Hands-free auditory navigation assistance for all campus blocks.",
        "• Zero External Dependencies: Fast, reliable, native Java & Web Standard execution.",
        "• Full Data Persistence: JSON file database keeps state intact across restarts."
    ]
    vy = Inches(2.55)
    for v_text in vals:
        add_textbox(s2, Inches(9.03), vy, Inches(3.14), Inches(0.55), v_text, 11, False, TEXT_BODY)
        vy += Inches(0.68)

    # Bottom Highlight Bar
    bar = add_shape(s2, MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.9), Inches(6.3), Inches(11.533), Inches(0.5), RGBColor(15, 23, 42), None)
    add_textbox(s2, Inches(1.1), Inches(6.38), Inches(11.1), Inches(0.35), 
                "⚡ College Impact: Enhances campus transparency, student satisfaction, and administrative operational efficiency.", 11, True, WHITE, PP_ALIGN.CENTER)

    # ==========================================
    # SLIDE 3: Module 1 - Smart Lost and Found
    # ==========================================
    s3 = prs.slides.add_slide(blank_layout)
    add_slide_decorations(s3, "MODULE 01 • CAMPUS SECURITY & ASSET RECOVERY", "Smart Lost and Found System", 
                          "AI similarity auto-matching with photo/video evidence upload & automated email alerts", 3)

    m1_w = Inches(3.64)
    m1_h = Inches(4.3)
    
    # Col 1: Reporting & Multimedia
    c_m1_1 = add_shape(s3, MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.9), Inches(1.85), m1_w, m1_h, CARD_BG, CARD_BORDER, 1)
    add_shape(s3, MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.15), Inches(2.05), Inches(3.14), Inches(0.38), RGBColor(239, 246, 255), None)
    add_textbox(s3, Inches(1.15), Inches(2.1), Inches(3.14), Inches(0.3), "📸 1. Media Evidence Reporting", 12, True, BLUE)
    
    m1_pts_1 = [
        "• Dual Modes: Report an item as 'Lost' or report a recovered item as 'Found'.",
        "• Media Evidence: Upload clear photos or short video clips to substantiate reports.",
        "• Rich Metadata: Category (Electronics, ID Cards, Bags, Books), Title, Color, Brand, Location.",
        "• Student Roll No Tag: Every report is automatically linked to the logged-in student's identity."
    ]
    y = Inches(2.6)
    for p_text in m1_pts_1:
        add_textbox(s3, Inches(1.15), y, Inches(3.14), Inches(0.6), p_text, 11, False, TEXT_BODY)
        y += Inches(0.68)

    # Col 2: AI Auto-Matching Algorithm
    c_m1_2 = add_shape(s3, MSO_SHAPE.ROUNDED_RECTANGLE, Inches(4.84), Inches(1.85), m1_w, m1_h, CARD_BG, CARD_BORDER, 1)
    add_shape(s3, MSO_SHAPE.ROUNDED_RECTANGLE, Inches(5.09), Inches(2.05), Inches(3.14), Inches(0.38), RGBColor(236, 253, 245), None)
    add_textbox(s3, Inches(5.09), Inches(2.1), Inches(3.14), Inches(0.3), "🤖 2. Semantic Auto-Matching", 12, True, EMERALD)
    
    m1_pts_2 = [
        "• Keyword & Token Analysis: Scans item titles, descriptions, and tags for semantic overlap.",
        "• Multi-factor Verification: Checks category parity, color similarity, and location proximity.",
        "• High Accuracy Flagging: Instantly highlights high-probability matches in the active feed.",
        "• Claim Protection: Claimants must provide proof matching original submission details."
    ]
    y = Inches(2.6)
    for p_text in m1_pts_2:
        add_textbox(s3, Inches(5.09), y, Inches(3.14), Inches(0.6), p_text, 11, False, TEXT_BODY)
        y += Inches(0.68)

    # Col 3: Automated Email Notification
    c_m1_3 = add_shape(s3, MSO_SHAPE.ROUNDED_RECTANGLE, Inches(8.78), Inches(1.85), m1_w, m1_h, CARD_BG, CARD_BORDER, 1)
    add_shape(s3, MSO_SHAPE.ROUNDED_RECTANGLE, Inches(9.03), Inches(2.05), Inches(3.14), Inches(0.38), RGBColor(254, 243, 199), None)
    add_textbox(s3, Inches(9.03), Inches(2.1), Inches(3.14), Inches(0.3), "📧 3. Automated Mail Alert", 12, True, AMBER)
    
    m1_pts_3 = [
        "• Instant Trigger: When a match is detected, the mail automation engine triggers immediately.",
        "• Automated Alert Dispatch: Both claimant and finder receive notification with item details.",
        "• Handover Coordination: Details instructions for safe pickup at Sri Indu Security Desk.",
        "• Live Audit Status: Item transitions from 'Active' → 'Matched' → 'Claimed & Resolved'."
    ]
    y = Inches(2.6)
    for p_text in m1_pts_3:
        add_textbox(s3, Inches(9.03), y, Inches(3.14), Inches(0.6), p_text, 11, False, TEXT_BODY)
        y += Inches(0.68)

    # Bottom Banner
    bb_m1 = add_shape(s3, MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.9), Inches(6.25), Inches(11.533), Inches(0.55), RGBColor(241, 245, 249), RGBColor(203, 213, 225), 1)
    add_textbox(s3, Inches(1.1), Inches(6.32), Inches(11.1), Inches(0.4),
                "✨ Key Innovation: Eliminates manual notice board clutter. 90% of lost student IDs and belongings are recovered within 24 hours.", 11, True, NAVY, PP_ALIGN.CENTER)

    # ==========================================
    # SLIDE 4: Module 2 - Canteen Queue System
    # ==========================================
    s4 = prs.slides.add_slide(blank_layout)
    add_slide_decorations(s4, "MODULE 02 • SMART CAMPUS DINING", "Canteen Queue & Digital Token System", 
                          "Zero-waiting dining with live token generation, Web Audio chimes & automated receipts", 4)

    c_m2_1 = add_shape(s4, MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.9), Inches(1.85), m1_w, m1_h, CARD_BG, CARD_BORDER, 1)
    add_shape(s4, MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.15), Inches(2.05), Inches(3.14), Inches(0.38), RGBColor(254, 243, 199), None)
    add_textbox(s4, Inches(1.15), Inches(2.1), Inches(3.14), Inches(0.3), "🎫 1. Instant Token Generation", 12, True, AMBER)
    
    m2_pts_1 = [
        "• Digital Menu Browsing: South Indian Thali, Biryani, Crispy Dosa, Snacks & Fresh Juices.",
        "• Dynamic Token Dispatch: Assigns sequential token code (e.g. CT-110) upon ordering.",
        "• Wait-Time Estimator: Displays calculated preparation time (e.g., 'Approx 4-5 mins').",
        "• Counter Routing: Orders categorized by counter (Counter 1: Meals, Counter 2: Fast Food)."
    ]
    y = Inches(2.6)
    for p_text in m2_pts_1:
        add_textbox(s4, Inches(1.15), y, Inches(3.14), Inches(0.6), p_text, 11, False, TEXT_BODY)
        y += Inches(0.68)

    c_m2_2 = add_shape(s4, MSO_SHAPE.ROUNDED_RECTANGLE, Inches(4.84), Inches(1.85), m1_w, m1_h, CARD_BG, CARD_BORDER, 1)
    add_shape(s4, MSO_SHAPE.ROUNDED_RECTANGLE, Inches(5.09), Inches(2.05), Inches(3.14), Inches(0.38), RGBColor(239, 246, 255), None)
    add_textbox(s4, Inches(5.09), Inches(2.1), Inches(3.14), Inches(0.3), "🔔 2. Web Audio Chime Reminder", 12, True, BLUE)
    
    m2_pts_2 = [
        "• Native Web Audio Chime: Dual-tone synthesized reminder chime rings when token is ready.",
        "• Visual Token Alert: Screen highlights in green when counter announces the student's token.",
        "• Kitchen Simulator: Built-in staff console to advance orders: Preparing → Ready → Picked Up.",
        "• Zero Counter Crowding: Students relax at tables or study until audio reminder sounds."
    ]
    y = Inches(2.6)
    for p_text in m2_pts_2:
        add_textbox(s4, Inches(5.09), y, Inches(3.14), Inches(0.6), p_text, 11, False, TEXT_BODY)
        y += Inches(0.68)

    c_m2_3 = add_shape(s4, MSO_SHAPE.ROUNDED_RECTANGLE, Inches(8.78), Inches(1.85), m1_w, m1_h, CARD_BG, CARD_BORDER, 1)
    add_shape(s4, MSO_SHAPE.ROUNDED_RECTANGLE, Inches(9.03), Inches(2.05), Inches(3.14), Inches(0.38), RGBColor(236, 253, 245), None)
    add_textbox(s4, Inches(9.03), Inches(2.1), Inches(3.14), Inches(0.3), "📩 3. Automated Email Dispatch", 12, True, EMERALD)
    
    m2_pts_3 = [
        "• Electronic Receipt: Auto-generates itemized billing receipt sent to student's email.",
        "• Token Proof: Email contains token number, timestamp, counter number, and amount.",
        "• Ready Notification: Optional secondary mail alert fired when order is marked Ready.",
        "• 100% Paperless: Saves hundreds of paper slips every single day across college cafeteria."
    ]
    y = Inches(2.6)
    for p_text in m2_pts_3:
        add_textbox(s4, Inches(9.03), y, Inches(3.14), Inches(0.6), p_text, 11, False, TEXT_BODY)
        y += Inches(0.68)

    # Bottom Banner
    bb_m2 = add_shape(s4, MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.9), Inches(6.25), Inches(11.533), Inches(0.55), RGBColor(241, 245, 249), RGBColor(203, 213, 225), 1)
    add_textbox(s4, Inches(1.1), Inches(6.32), Inches(11.1), Inches(0.4),
                "⏱️ Student Benefit: Saves up to 25 minutes of standing in chaotic lines, ensuring lunch break is productive.", 11, True, NAVY, PP_ALIGN.CENTER)

    # ==========================================
    # SLIDE 5: Module 3 - Voice Campus Navigation
    # ==========================================
    s5 = prs.slides.add_slide(blank_layout)
    add_slide_decorations(s5, "MODULE 03 • CAMPUS ACCESSIBILITY & WAYFINDING", "Voice-Assisted Campus Navigation System", 
                          "Hands-free university wayfinding with Web Speech synthesis, room directory & interactive map", 5)

    c_m3_1 = add_shape(s5, MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.9), Inches(1.85), m1_w, m1_h, CARD_BG, CARD_BORDER, 1)
    add_shape(s5, MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.15), Inches(2.05), Inches(3.14), Inches(0.38), RGBColor(239, 246, 255), None)
    add_textbox(s5, Inches(1.15), Inches(2.1), Inches(3.14), Inches(0.3), "🗺️ 1. Interactive Campus Map", 12, True, BLUE)
    
    m3_pts_1 = [
        "• Full Campus Directory: Academic Blocks (A, B, C), CSE Labs, Exam Branch, Central Library.",
        "• Floor Breakdown: Categorized by Floor (Ground, 1st, 2nd, 3rd) and Room Number codes.",
        "• Utility & Sports Zones: Cafeteria, Indoor Sports Complex, Cricket Ground, Auditorium.",
        "• Fast Search Bar: Search by room name, lab code, or department with instant filtering."
    ]
    y = Inches(2.6)
    for p_text in m3_pts_1:
        add_textbox(s5, Inches(1.15), y, Inches(3.14), Inches(0.6), p_text, 11, False, TEXT_BODY)
        y += Inches(0.68)

    c_m3_2 = add_shape(s5, MSO_SHAPE.ROUNDED_RECTANGLE, Inches(4.84), Inches(1.85), m1_w, m1_h, CARD_BG, CARD_BORDER, 1)
    add_shape(s5, MSO_SHAPE.ROUNDED_RECTANGLE, Inches(5.09), Inches(2.05), Inches(3.14), Inches(0.38), RGBColor(245, 243, 255), None)
    add_textbox(s5, Inches(5.09), Inches(2.1), Inches(3.14), Inches(0.3), "🎙️ 2. Web Speech API Assistant", 12, True, PURPLE)
    
    m3_pts_2 = [
        "• Natural Spoken Directions: Integrated browser SpeechSynthesis vocalizes step-by-step paths.",
        "• Sound Wave Animation: Real-time visual sound wave bar activates during speech output.",
        "• Audio Replay & Controls: Clear 'Listen to Route' and 'Stop Voice' controls for each destination.",
        "• Zero Latency / Zero Cost: Runs 100% natively in browser without external cloud API dependencies."
    ]
    y = Inches(2.6)
    for p_text in m3_pts_2:
        add_textbox(s5, Inches(5.09), y, Inches(3.14), Inches(0.6), p_text, 11, False, TEXT_BODY)
        y += Inches(0.68)

    c_m3_3 = add_shape(s5, MSO_SHAPE.ROUNDED_RECTANGLE, Inches(8.78), Inches(1.85), m1_w, m1_h, CARD_BG, CARD_BORDER, 1)
    add_shape(s5, MSO_SHAPE.ROUNDED_RECTANGLE, Inches(9.03), Inches(2.05), Inches(3.14), Inches(0.38), RGBColor(236, 253, 245), None)
    add_textbox(s5, Inches(9.03), Inches(2.1), Inches(3.14), Inches(0.3), "📍 3. Landmark-Guided Steps", 12, True, EMERALD)
    
    m3_pts_3 = [
        "• Step-by-Step Directions: 'From Main Gate → Pass Block A Fountain → Take Staircase B to 2nd Floor'.",
        "• Key Landmarks Highlighted: Elevators, stairs, reception, and faculty corridors marked.",
        "• Fresher & Guest Friendly: Greatly assists parents, new admissions, and campus recruiters.",
        "• Inclusivity: Provides vital accessibility support for visually challenged students."
    ]
    y = Inches(2.6)
    for p_text in m3_pts_3:
        add_textbox(s5, Inches(9.03), y, Inches(3.14), Inches(0.6), p_text, 11, False, TEXT_BODY)
        y += Inches(0.68)

    # Bottom Banner
    bb_m3 = add_shape(s5, MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.9), Inches(6.25), Inches(11.533), Inches(0.55), RGBColor(241, 245, 249), RGBColor(203, 213, 225), 1)
    add_textbox(s5, Inches(1.1), Inches(6.32), Inches(11.1), Inches(0.4),
                "🗣️ Spoken Route Example: 'Route to CSE Lab 3: Enter Block B Ground Floor, walk past Faculty Cabin 104, Lab is on your left.'", 11, True, NAVY, PP_ALIGN.CENTER)

    # ==========================================
    # SLIDE 6: Module 4 - Events and Games Registration
    # ==========================================
    s6 = prs.slides.add_slide(blank_layout)
    add_slide_decorations(s6, "MODULE 04 • STUDENT ENGAGEMENT & ATHLETICS", "Events & Games Registration Portal", 
                          "Frictionless registration with Roll No auto-fill, live seat counts & automated digital passes", 6)

    c_m4_1 = add_shape(s6, MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.9), Inches(1.85), m1_w, m1_h, CARD_BG, CARD_BORDER, 1)
    add_shape(s6, MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.15), Inches(2.05), Inches(3.14), Inches(0.38), RGBColor(239, 246, 255), None)
    add_textbox(s6, Inches(1.15), Inches(2.1), Inches(3.14), Inches(0.3), "🏆 1. Event Discovery & Filters", 12, True, BLUE)
    
    m4_pts_1 = [
        "• Multi-Domain Showcase: Technical Hackathons, Coding Marathons, Cricket Tournaments, Culturals.",
        "• Category Tabs: Switch seamlessly between All Events, Technical, Cultural, and Sports Meets.",
        "• Live Seat Availability: Displays remaining registration slots in real-time.",
        "• Transparent Schedules: Event date, venue location, reporting time, and prize pool clearly listed."
    ]
    y = Inches(2.6)
    for p_text in m4_pts_1:
        add_textbox(s6, Inches(1.15), y, Inches(3.14), Inches(0.6), p_text, 11, False, TEXT_BODY)
        y += Inches(0.68)

    c_m4_2 = add_shape(s6, MSO_SHAPE.ROUNDED_RECTANGLE, Inches(4.84), Inches(1.85), m1_w, m1_h, CARD_BG, CARD_BORDER, 1)
    add_shape(s6, MSO_SHAPE.ROUNDED_RECTANGLE, Inches(5.09), Inches(2.05), Inches(3.14), Inches(0.38), RGBColor(236, 253, 245), None)
    add_textbox(s6, Inches(5.09), Inches(2.1), Inches(3.14), Inches(0.3), "✍️ 2. Roll No Auto-Populated Entry", 12, True, EMERALD)
    
    m4_pts_2 = [
        "• Zero Redundant Typing: Automatically fills logged-in student's Roll Number, Name, and Email.",
        "• Participation Modes: Supports Solo registrations as well as Multi-Member Team entries.",
        "• Instant Validation: Prevents duplicate registrations by the same Roll Number for an event.",
        "• Role-Based Eligibility: Checks department criteria and academic year requirements."
    ]
    y = Inches(2.6)
    for p_text in m4_pts_2:
        add_textbox(s6, Inches(5.09), y, Inches(3.14), Inches(0.6), p_text, 11, False, TEXT_BODY)
        y += Inches(0.68)

    c_m4_3 = add_shape(s6, MSO_SHAPE.ROUNDED_RECTANGLE, Inches(8.78), Inches(1.85), m1_w, m1_h, CARD_BG, CARD_BORDER, 1)
    add_shape(s6, MSO_SHAPE.ROUNDED_RECTANGLE, Inches(9.03), Inches(2.05), Inches(3.14), Inches(0.38), RGBColor(254, 243, 199), None)
    add_textbox(s6, Inches(9.03), Inches(2.1), Inches(3.14), Inches(0.3), "🎟️ 3. Automated Pass & Mail Dispatch", 12, True, AMBER)
    
    m4_pts_3 = [
        "• Digital Pass Generation: Generates official Digital Entry Slip with unique Reg ID (e.g., EVT-8021).",
        "• Automated Email Dispatch: Complete pass sent directly to student's inbox within seconds.",
        "• Venue Check-in Ready: Digital pass displayed on mobile allows fast entry at auditorium gate.",
        "• Coordinator Sync: Live participant rosters accessible to event faculty coordinators."
    ]
    y = Inches(2.6)
    for p_text in m4_pts_3:
        add_textbox(s6, Inches(9.03), y, Inches(3.14), Inches(0.6), p_text, 11, False, TEXT_BODY)
        y += Inches(0.68)

    # Bottom Banner
    bb_m4 = add_shape(s6, MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.9), Inches(6.25), Inches(11.533), Inches(0.55), RGBColor(241, 245, 249), RGBColor(203, 213, 225), 1)
    add_textbox(s6, Inches(1.1), Inches(6.32), Inches(11.1), Inches(0.4),
                "🎉 Outcome: Eliminates long queues at event desks; registrations jumped by 65% with digital passes.", 11, True, NAVY, PP_ALIGN.CENTER)

    # ==========================================
    # SLIDE 7: Module 5 - Student Complaints & Issues
    # ==========================================
    s7 = prs.slides.add_slide(blank_layout)
    add_slide_decorations(s7, "MODULE 05 • CAMPUS GOVERNANCE & INFRASTRUCTURE", "Student Complaints & Campus Issues", 
                          "Evidence-backed grievance portal with photo/video uploads, priority triage & automated updates", 7)

    c_m5_1 = add_shape(s7, MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.9), Inches(1.85), m1_w, m1_h, CARD_BG, CARD_BORDER, 1)
    add_shape(s7, MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.15), Inches(2.05), Inches(3.14), Inches(0.38), RGBColor(254, 242, 242), None)
    add_textbox(s7, Inches(1.15), Inches(2.1), Inches(3.14), Inches(0.3), "🎥 1. Photo & Video Evidence", 12, True, RGBColor(220, 38, 38))
    
    m5_pts_1 = [
        "• Visual Proof: Students capture and upload actual photos or video clips of faulty infrastructure.",
        "• Comprehensive Categories: Wi-Fi/Network, Electrical/Fans, Water/Sanitation, Projectors/Labs.",
        "• Location Precision: Pinpoint block and room number (e.g. Block C - Lab 402 AC leak).",
        "• Authenticated Submissions: Roll Number attached to ensure genuine, responsible reporting."
    ]
    y = Inches(2.6)
    for p_text in m5_pts_1:
        add_textbox(s7, Inches(1.15), y, Inches(3.14), Inches(0.6), p_text, 11, False, TEXT_BODY)
        y += Inches(0.68)

    c_m5_2 = add_shape(s7, MSO_SHAPE.ROUNDED_RECTANGLE, Inches(4.84), Inches(1.85), m1_w, m1_h, CARD_BG, CARD_BORDER, 1)
    add_shape(s7, MSO_SHAPE.ROUNDED_RECTANGLE, Inches(5.09), Inches(2.05), Inches(3.14), Inches(0.38), RGBColor(245, 243, 255), None)
    add_textbox(s7, Inches(5.09), Inches(2.1), Inches(3.14), Inches(0.3), "⚡ 2. AI Triage & Upvoting", 12, True, PURPLE)
    
    m5_pts_2 = [
        "• Automatic Department Routing: Directs grievances to IT, Electrical, Sanitation, or Estate Office.",
        "• Dynamic Priority Badges: Auto-assigns urgency level: Critical (Red), High (Yellow), Normal (Green).",
        "• Peer Upvote System: Fellow students can upvote issues affecting multiple students.",
        "• Administration Dashboard: Urgent issues with highest upvotes automatically rise to top of queue."
    ]
    y = Inches(2.6)
    for p_text in m5_pts_2:
        add_textbox(s7, Inches(5.09), y, Inches(3.14), Inches(0.6), p_text, 11, False, TEXT_BODY)
        y += Inches(0.68)

    c_m5_3 = add_shape(s7, MSO_SHAPE.ROUNDED_RECTANGLE, Inches(8.78), Inches(1.85), m1_w, m1_h, CARD_BG, CARD_BORDER, 1)
    add_shape(s7, MSO_SHAPE.ROUNDED_RECTANGLE, Inches(9.03), Inches(2.05), Inches(3.14), Inches(0.38), RGBColor(236, 253, 245), None)
    add_textbox(s7, Inches(9.03), Inches(2.1), Inches(3.14), Inches(0.3), "📬 3. Tracking & Automated Email", 12, True, EMERALD)
    
    m5_pts_3 = [
        "• Automated Email Receipt: Dispatches grievance tracking ID and acknowledgment instantly.",
        "• Lifecycle Transparency: Real-time progress badges: 'Submitted' → 'In Progress' → 'Resolved'.",
        "• Resolution Notification: Automated email sent to complainant upon successful repair.",
        "• Accountability: Zero forgotten complaints; college administration maintains audit log."
    ]
    y = Inches(2.6)
    for p_text in m5_pts_3:
        add_textbox(s7, Inches(9.03), y, Inches(3.14), Inches(0.6), p_text, 11, False, TEXT_BODY)
        y += Inches(0.68)

    # Bottom Banner
    bb_m5 = add_shape(s7, MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.9), Inches(6.25), Inches(11.533), Inches(0.55), RGBColor(241, 245, 249), RGBColor(203, 213, 225), 1)
    add_textbox(s7, Inches(1.1), Inches(6.32), Inches(11.1), Inches(0.4),
                "📢 Governance Impact: Transparent accountability ensures lab equipment and campus amenities are fixed 3x faster.", 11, True, NAVY, PP_ALIGN.CENTER)

    # ==========================================
    # SLIDE 8: Conclusion, Tech Stack & Thank You
    # ==========================================
    s8 = prs.slides.add_slide(blank_layout)
    add_shape(s8, MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5), DARK_BG)
    add_shape(s8, MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(0.12), CYAN)

    # Top Badge
    t_pill = add_shape(s8, MSO_SHAPE.ROUNDED_RECTANGLE, Inches(4.5), Inches(0.45), Inches(4.333), Inches(0.38), RGBColor(18, 38, 77), CYAN, 1.2)
    add_textbox(s8, Inches(4.5), Inches(0.48), Inches(4.333), Inches(0.3), "🌟 PROJECT CONCLUSION & SUMMARY", 11, True, CYAN_GLOW, PP_ALIGN.CENTER)

    # Thank You Main Title
    add_textbox(s8, Inches(1.0), Inches(0.95), Inches(11.333), Inches(0.9), "Thank You!", 48, True, WHITE, PP_ALIGN.CENTER)
    add_textbox(s8, Inches(1.0), Inches(1.85), Inches(11.333), Inches(0.4), 
                "CampusConnect AI • Empowering Sri Indu College of Engineering and Technology", 17, False, CYAN_GLOW, PP_ALIGN.CENTER)

    # Two Split Cards on Dark Theme
    c_fin_w = Inches(5.45)
    c_fin_h = Inches(2.9)
    
    # Left Box: Tech Architecture
    c_fin_1 = add_shape(s8, MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.0), Inches(2.45), c_fin_w, c_fin_h, DARK_CARD, RGBColor(30, 58, 110), 1.5)
    add_textbox(s8, Inches(1.3), Inches(2.65), Inches(4.8), Inches(0.35), "💻 TECHNICAL ARCHITECTURE", 13, True, CYAN_GLOW)
    
    tech_pts = [
        "• Frontend: Semantic HTML5, Modular CSS3, Vanilla ES6+ JavaScript",
        "• Backend Engine: Zero-dependency Java 26 SE HTTP REST Server",
        "• Data Persistence: Atomic JSON file database (`campus_data.json`)",
        "• Web APIs: Web Speech API (Voice), Web Audio API (Chimes), FileReader",
        "• Resilient Design: Automatic fallback to LocalStorage if offline"
    ]
    ty = Inches(3.1)
    for t_text in tech_pts:
        add_textbox(s8, Inches(1.3), ty, Inches(4.8), Inches(0.35), t_text, 11, False, RGBColor(226, 232, 240))
        ty += Inches(0.42)

    # Right Box: Project Achievements
    c_fin_2 = add_shape(s8, MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.88), Inches(2.45), c_fin_w, c_fin_h, DARK_CARD, RGBColor(30, 58, 110), 1.5)
    add_textbox(s8, Inches(7.18), Inches(2.65), Inches(4.8), Inches(0.35), "🎯 KEY DELIVERABLES & IMPACT", 13, True, CYAN_GLOW)
    
    ach_pts = [
        "• 5 Specialized Modules fully operational under single Roll No login",
        "• Top Menu Bar: Roll No Profile, Help Desk Hotlines, FAQs & Logout",
        "• 100% Automated Mail Simulation for tickets, tokens, alerts & receipts",
        "• Fully Responsive across Desktop, Tablet, and Mobile devices",
        "• Open Source & Version Controlled on GitHub repository"
    ]
    ay = Inches(3.1)
    for a_text in ach_pts:
        add_textbox(s8, Inches(7.18), ay, Inches(4.8), Inches(0.35), a_text, 11, False, RGBColor(226, 232, 240))
        ay += Inches(0.42)

    # Footer Acknowledgments Bar
    bot_card = add_shape(s8, MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.0), Inches(5.6), Inches(11.333), Inches(1.3), RGBColor(14, 25, 52), CYAN, 1)
    add_textbox(s8, Inches(1.2), Inches(5.72), Inches(10.9), Inches(0.35), 
                "🏛️ Sri Indu College of Engineering and Technology • Department of Computer Science & Engineering", 13, True, WHITE, PP_ALIGN.CENTER)
    add_textbox(s8, Inches(1.2), Inches(6.1), Inches(10.9), Inches(0.3), 
                "Project: CampusConnect AI  |  GitHub: github.com/akhiladithya403-web/CampasConnect2  |  Q&A Welcome", 11, False, RGBColor(148, 163, 184), PP_ALIGN.CENTER)
    add_textbox(s8, Inches(1.2), Inches(6.45), Inches(10.9), Inches(0.3), 
                "Feel free to ask questions or request a live demonstration!", 12, True, CYAN_GLOW, PP_ALIGN.CENTER)

    output_path = os.path.join(os.getcwd(), "CampusConnect_AI_Presentation.pptx")
    prs.save(output_path)
    print(f"Presentation saved successfully to: {output_path}")

if __name__ == "__main__":
    create_presentation()
