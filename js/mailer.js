/**
 * CampusConnect AI - Email Automation Engine & Virtual Mailbox Viewer
 * Automates email generation for:
 * 1. Lost & Found AI match alerts
 * 2. Canteen queue digital tokens & "Order Ready" reminder emails
 * 3. Events registration tickets & Game athlete passes
 * 4. Student Complaints & Campus Issues receipts
 */

const CampusMailer = window.CampusMailer = (() => {

  /**
   * Dispatches automated Lost & Found match email
   */
  function sendLostFoundMatchAlert(lostItem, foundItem, matchScore) {
    const subject = `✨ [CampusConnect AI] Match Detected (${matchScore}% match) for: ${lostItem.title}`;
    const body = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
        <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 24px; text-align: center; color: white;">
          <h1 style="margin: 0 0 6px 0; font-size: 22px;">🔍 Lost Item Match Detected!</h1>
          <p style="margin: 0; font-size: 14px; opacity: 0.9;">CampusConnect AI Automated Matching Algorithm</p>
        </div>
        <div style="padding: 24px; color: #334155; line-height: 1.6;">
          <p>Hello <strong>${lostItem.contactEmail.split('@')[0]}</strong> (Roll: ${lostItem.reporterRollNo || 'Student'}),</p>
          <p>Good news! An item turned into campus security or reported found has an estimated <strong>${matchScore}% similarity</strong> with your reported lost item.</p>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; color: #64748b; width: 40%;"><strong>Your Lost Item:</strong></td>
                <td style="padding: 6px 0; font-weight: 600; color: #1e293b;">${lostItem.title}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;"><strong>Found Item Match:</strong></td>
                <td style="padding: 6px 0; font-weight: 600; color: #2563eb;">${foundItem.title}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;"><strong>Location Found:</strong></td>
                <td style="padding: 6px 0; color: #1e293b;">${foundItem.location}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;"><strong>Found Description:</strong></td>
                <td style="padding: 6px 0; color: #1e293b;">${foundItem.description}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;"><strong>Reported By:</strong></td>
                <td style="padding: 6px 0; color: #1e293b;">${foundItem.finderName || 'Security Staff'}</td>
              </tr>
            </table>
          </div>

          <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 4px; font-size: 13px; color: #1e40af; margin-bottom: 20px;">
            📌 <strong>Next Step to Claim:</strong> Please bring your College ID Card with Roll Number to the Campus Security Office (Main Gate 1) or email: <strong>${foundItem.contactEmail || 'security@college.edu'}</strong>.
          </div>

          <p style="font-size: 13px; color: #64748b; margin-top: 24px;">Once you have successfully reclaimed your belongings, please mark your item as 'Resolved' in the portal.</p>
        </div>
        <div style="background: #f1f5f9; padding: 14px; text-align: center; font-size: 12px; color: #94a3b8;">
          CampusConnect AI System &bull; College Student Support &bull; Automated Match Service
        </div>
      </div>
    `;

    CampusStore.addMail({
      subject,
      sender: 'CampusConnect AI Lost & Found <lostfound@college.edu>',
      recipient: lostItem.contactEmail,
      category: 'Lost & Found',
      body
    });

    if (window.showAppToast) {
      window.showAppToast('📧 Automated Mail Sent: Potential match found for your item!', 'success');
    }
  }

  /**
   * Dispatches automated Canteen Queue Token email
   */
  function sendCanteenTokenConfirmation(token, studentData) {
    const subject = `🍽️ [Canteen Token #${token.tokenNo}] Order Confirmed - ${token.counter}`;
    const body = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
        <div style="background: linear-gradient(135deg, #ea580c 0%, #f97316 100%); padding: 24px; text-align: center; color: white;">
          <h1 style="margin: 0 0 6px 0; font-size: 22px;">🍽️ Wait-Free Canteen Token Generated</h1>
          <p style="margin: 0; font-size: 14px; opacity: 0.9;">CampusConnect AI Smart Food Court</p>
        </div>
        <div style="padding: 24px; color: #334155; line-height: 1.6;">
          <p>Hello <strong>${studentData.fullName}</strong> (Roll: <strong>${studentData.rollNo}</strong>),</p>
          <p>Your canteen order has been placed without waiting in queue! Here is your digital token:</p>

          <div style="background: #fff7ed; border: 2px dashed #fdba74; border-radius: 12px; padding: 20px; text-align: center; margin: 18px 0;">
            <span style="font-size: 12px; font-weight: 700; color: #c2410c; text-transform: uppercase; letter-spacing: 1px;">YOUR DIGITAL TOKEN</span>
            <div style="font-size: 38px; font-weight: 900; color: #ea580c; margin: 8px 0; letter-spacing: 2px;">#${token.tokenNo}</div>
            <div style="font-size: 13px; font-weight: 700; color: #9a3412;">Pickup Counter: ${token.counter}</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Status: <span style="color: #ea580c; font-weight: bold;">${token.status}</span> &bull; Est. Prep Time: ${token.estReadyTime || '5-8 mins'}</div>
          </div>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 16px;">
            <h4 style="margin: 0 0 10px 0; font-size: 13px; color: #475569; text-transform: uppercase;">Order Items Summary</h4>
            <div style="font-size: 14px; font-weight: 600; color: #1e293b; margin-bottom: 6px;">${token.itemsSummary}</div>
            <div style="font-size: 14px; font-weight: 700; color: #ea580c;">Total Amount: ₹${token.totalAmount} (Paid / Token Verified)</div>
          </div>

          <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 4px; font-size: 13px; color: #15803d;">
            🔔 <strong>Reminder System Activated:</strong> You will hear an audio chime and receive a prompt notification the second your token is called at Counter ${token.counter}!
          </div>
        </div>
        <div style="background: #f1f5f9; padding: 14px; text-align: center; font-size: 12px; color: #94a3b8;">
          CampusConnect AI &bull; Canteen Queue Automation &bull; Zero Waiting System
        </div>
      </div>
    `;

    CampusStore.addMail({
      subject,
      sender: 'Campus Canteen Desk <canteen@college.edu>',
      recipient: studentData.email,
      category: 'Canteen Queue',
      body
    });

    if (window.showAppToast) {
      window.showAppToast(`📧 Token #${token.tokenNo} generated & sent to ${studentData.email}!`, 'success');
    }
  }

  /**
   * Dispatches automated Canteen "Order Ready" Reminder email
   */
  function sendCanteenTokenReadyAlert(token, studentData) {
    const subject = `🔔 [ORDER READY] Token #${token.tokenNo} is Ready for Collection!`;
    const body = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
        <div style="background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%); padding: 24px; text-align: center; color: white;">
          <h1 style="margin: 0 0 6px 0; font-size: 24px;">🔔 Token #${token.tokenNo} is Ready!</h1>
          <p style="margin: 0; font-size: 14px; opacity: 0.9;">Please collect your order from ${token.counter}</p>
        </div>
        <div style="padding: 24px; color: #334155; line-height: 1.6;">
          <p>Hi <strong>${studentData.fullName}</strong> (Roll: ${studentData.rollNo}),</p>
          <p>Your food is freshly prepared and hot at <strong>${token.counter}</strong>.</p>
          <div style="background: #f0fdf4; border: 2px solid #86efac; border-radius: 8px; padding: 16px; margin: 16px 0; text-align: center;">
            <div style="font-size: 32px; font-weight: bold; color: #15803d;">#${token.tokenNo}</div>
            <p style="margin: 6px 0 0 0; font-weight: 600; color: #166534;">${token.itemsSummary}</p>
          </div>
          <p style="font-size: 13px; color: #64748b;">Please show your Token #${token.tokenNo} on your phone screen at the counter for immediate collection.</p>
        </div>
        <div style="background: #f1f5f9; padding: 14px; text-align: center; font-size: 12px; color: #94a3b8;">
          CampusConnect AI &bull; Canteen Queue Reminder Engine
        </div>
      </div>
    `;

    CampusStore.addMail({
      subject,
      sender: 'Campus Canteen Alerts <canteen-alerts@college.edu>',
      recipient: studentData.email,
      category: 'Canteen Queue',
      body
    });

    if (window.showAppToast) {
      window.showAppToast(`🔔 Food Ready! Token #${token.tokenNo} called at ${token.counter}!`, 'warning');
    }
  }

  /**
   * Dispatches automated Event Registration pass
   */
  function sendEventRegistrationConfirmation(event, studentData) {
    const regId = 'EV-PASS-' + Math.floor(100000 + Math.random() * 900000);
    const subject = `🎟️ [Confirmed] Admission Pass for ${event.title} (Pass #${regId})`;
    const body = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
        <div style="background: linear-gradient(135deg, #047857 0%, #10b981 100%); padding: 24px; text-align: center; color: white;">
          <h1 style="margin: 0 0 6px 0; font-size: 22px;">🎟️ Event Registration Confirmed!</h1>
          <p style="margin: 0; font-size: 14px; opacity: 0.9;">CampusConnect AI Digital Admission Pass</p>
        </div>
        <div style="padding: 24px; color: #334155; line-height: 1.6;">
          <p>Dear <strong>${studentData.fullName}</strong>,</p>
          <p>You are officially registered for <strong>${event.title}</strong>. Please present this digital admission pass at the entrance.</p>

          <div style="background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 8px; padding: 18px; margin: 18px 0; text-align: left;">
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 12px;">
              <span style="font-size: 12px; text-transform: uppercase; color: #64748b; letter-spacing: 1px;">Digital Ticket</span>
              <span style="font-size: 12px; font-weight: 700; color: #047857;">PASS: ${regId}</span>
            </div>
            <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
              <tr>
                <td style="padding: 4px 0; color: #64748b;"><strong>Student Name:</strong></td>
                <td style="padding: 4px 0; font-weight: 600;">${studentData.fullName}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #64748b;"><strong>Roll Number:</strong></td>
                <td style="padding: 4px 0; font-weight: 700; color: #047857;">${studentData.rollNo}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #64748b;"><strong>Department:</strong></td>
                <td style="padding: 4px 0;">${studentData.department}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #64748b;"><strong>Year of Study:</strong></td>
                <td style="padding: 4px 0;">${studentData.year}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #64748b;"><strong>Date & Time:</strong></td>
                <td style="padding: 4px 0; color: #047857; font-weight: 600;">${event.date} | ${event.time}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #64748b;"><strong>Venue:</strong></td>
                <td style="padding: 4px 0; font-weight: 600;">${event.venue}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #64748b;"><strong>Coordinator:</strong></td>
                <td style="padding: 4px 0;">${event.coordinator}</td>
              </tr>
            </table>
          </div>

          <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 12px; border-radius: 4px; font-size: 13px; color: #065f46;">
            💡 <em>Campus Tip:</em> Use the <strong>Voice Assistance Navigation</strong> tool to get spoken walking directions straight to ${event.venue}!
          </div>
        </div>
        <div style="background: #f1f5f9; padding: 14px; text-align: center; font-size: 12px; color: #94a3b8;">
          Campus Events Affairs &bull; Automatic Pass Dispatcher &bull; CampusConnect AI
        </div>
      </div>
    `;

    CampusStore.addMail({
      subject,
      sender: 'College Events Desk <events@college.edu>',
      recipient: studentData.email,
      category: 'Events & Games',
      body
    });

    if (window.showAppToast) {
      window.showAppToast(`📧 Event Pass generated & emailed to ${studentData.email}!`, 'success');
    }

    return regId;
  }

  /**
   * Dispatches automated Games & Sports Registration pass
   */
  function sendGameRegistrationConfirmation(game, studentData) {
    const athleteId = 'ATHLETE-' + Math.floor(100000 + Math.random() * 900000);
    const subject = `🏆 [Athlete Confirmed] Registration for ${game.title} (ID: #${athleteId})`;
    const body = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
        <div style="background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%); padding: 24px; text-align: center; color: white;">
          <h1 style="margin: 0 0 6px 0; font-size: 22px;">🏆 Athlete Registration Confirmed!</h1>
          <p style="margin: 0; font-size: 14px; opacity: 0.9;">Inter-Department Sports & Games Tournament</p>
        </div>
        <div style="padding: 24px; color: #334155; line-height: 1.6;">
          <p>Dear <strong>${studentData.fullName}</strong>,</p>
          <p>Your team/athlete registration for <strong>${game.title} (${game.sport})</strong> is successfully received by the Sports Board.</p>

          <div style="background: #fffbeb; border: 2px solid #fde68a; border-radius: 8px; padding: 18px; margin: 18px 0;">
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #fef3c7; padding-bottom: 10px; margin-bottom: 12px;">
              <span style="font-size: 12px; text-transform: uppercase; color: #92400e; font-weight: 700;">Athlete ID: ${athleteId}</span>
              <span style="font-size: 12px; font-weight: 700; color: #b45309;">${game.sport.toUpperCase()}</span>
            </div>
            <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
              <tr>
                <td style="padding: 4px 0; color: #78350f;"><strong>Participant Name:</strong></td>
                <td style="padding: 4px 0; font-weight: 600;">${studentData.fullName}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #78350f;"><strong>Roll Number:</strong></td>
                <td style="padding: 4px 0; font-weight: 700; color: #b45309;">${studentData.rollNo}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #78350f;"><strong>Department:</strong></td>
                <td style="padding: 4px 0;">${studentData.department}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #78350f;"><strong>Year:</strong></td>
                <td style="padding: 4px 0;">${studentData.year}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #78350f;"><strong>Team / Format:</strong></td>
                <td style="padding: 4px 0; font-weight: 600;">${studentData.teamName || 'Solo Participant'}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #78350f;"><strong>Venue:</strong></td>
                <td style="padding: 4px 0; font-weight: 600;">${game.venue}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #78350f;"><strong>Schedule:</strong></td>
                <td style="padding: 4px 0;">${game.schedule}</td>
              </tr>
            </table>
          </div>

          <div style="background: #f8fafc; border-left: 4px solid #f59e0b; padding: 12px; border-radius: 4px; font-size: 13px; color: #475569;">
            ⚠️ <strong>Reporting Note:</strong> Please report 30 mins before fixture time with college sports uniform and ID card.
          </div>
        </div>
        <div style="background: #f1f5f9; padding: 14px; text-align: center; font-size: 12px; color: #94a3b8;">
          College Physical Education Board &bull; CampusConnect AI
        </div>
      </div>
    `;

    CampusStore.addMail({
      subject,
      sender: 'Department of Physical Education <sports@college.edu>',
      recipient: studentData.email,
      category: 'Events & Games',
      body
    });

    if (window.showAppToast) {
      window.showAppToast(`📧 Athlete pass confirmed & sent to ${studentData.email}!`, 'success');
    }

    return athleteId;
  }

  /**
   * Dispatches automated Issue / Complaint receipt email
   */
  function sendComplaintReceipt(issue, studentData) {
    const subject = `📋 [Ticket #${issue.id}] Report Received: ${issue.title}`;
    const body = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
        <div style="background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); padding: 24px; text-align: center; color: white;">
          <h1 style="margin: 0 0 6px 0; font-size: 22px;">📋 Campus Issue / Complaint Logged</h1>
          <p style="margin: 0; font-size: 14px; opacity: 0.9;">Ticket Tracking Reference: #${issue.id}</p>
        </div>
        <div style="padding: 24px; color: #334155; line-height: 1.6;">
          <p>Hello <strong>${issue.reportedBy}</strong> (Roll: <strong>${issue.reporterRollNo || studentData?.rollNo || 'N/A'}</strong>),</p>
          <p>Thank you for reporting this issue. Our CampusConnect AI triage system has logged your report and routed it to the designated maintenance authority.</p>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="margin: 0 0 8px 0;"><strong>Issue Summary:</strong> ${issue.title}</p>
            <p style="margin: 0 0 8px 0;"><strong>Category:</strong> ${issue.category}</p>
            <p style="margin: 0 0 8px 0;"><strong>Location:</strong> ${issue.block} - ${issue.floor} (${issue.locationDetails || 'Campus'})</p>
            <p style="margin: 0 0 8px 0;"><strong>AI Assigned Priority:</strong> <span style="color: #dc2626; font-weight: 700;">${issue.priority || 'Normal'}</span></p>
            <p style="margin: 0 0 8px 0;"><strong>Department:</strong> ${issue.aiTriage?.department || 'Estate & Facilities'}</p>
            <p style="margin: 0;"><strong>Media Proof:</strong> ${issue.mediaUrl ? 'Photo/Video Evidence Attached' : 'None'}</p>
          </div>

          <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px; border-radius: 4px; font-size: 13px; color: #1e40af;">
            🔍 You can track the real-time resolution status anytime on the <strong>Student Complaints & Campus Issues</strong> dashboard.
          </div>
        </div>
        <div style="background: #f1f5f9; padding: 14px; text-align: center; font-size: 12px; color: #94a3b8;">
          Campus Maintenance Cell & Grievance Committee &bull; CampusConnect AI
        </div>
      </div>
    `;

    CampusStore.addMail({
      subject,
      sender: 'Campus Grievance & Maintenance Desk <complaints@college.edu>',
      recipient: issue.reporterEmail || studentData?.email || 'student@college.edu',
      category: 'Complaints & Issues',
      body
    });

    if (window.showAppToast) {
      window.showAppToast(`📧 Complaint logged! Ticket #${issue.id} emailed to ${issue.reporterEmail || 'student'}`, 'success');
    }
  }

  return {
    sendLostFoundMatchAlert,
    sendCanteenTokenConfirmation,
    sendCanteenTokenReadyAlert,
    sendEventRegistrationConfirmation,
    sendGameRegistrationConfirmation,
    sendComplaintReceipt,
    // Alias for backward compatibility
    sendIssueReceipt: sendComplaintReceipt
  };
})();
