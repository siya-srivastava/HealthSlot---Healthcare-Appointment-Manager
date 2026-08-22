const { google } = require('googleapis');

const isGoogleConfigured = () => {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_ID.trim() !== '' &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_CLIENT_SECRET.trim() !== ''
  );
};

const getOAuthClient = () => {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/calendar/oauth/callback'
  );
};

const getAuthUrl = (userId) => {
  if (!isGoogleConfigured()) {
    return null;
  }
  const oauth2Client = getOAuthClient();
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar.events'],
    prompt: 'consent',
    state: userId
  });
};

const getTokensFromCode = async (code) => {
  const oauth2Client = getOAuthClient();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
};

const createCalendarEvent = async (refreshToken, { summary, description, startTime, endTime, attendeeEmail }) => {
  if (!refreshToken) return { success: false, error: 'No refresh token' };

  // Simulated / Mock Calendar mode for demo testing without Google API setup
  if (refreshToken.startsWith('demo_') || !isGoogleConfigured()) {
    console.log(`\n[GOOGLE CALENDAR SYNC] Event created: "${summary}" (${new Date(startTime).toLocaleString()} - ${new Date(endTime).toLocaleString()})`);
    return { success: true, eventId: `cal_event_${Date.now()}` };
  }

  try {
    const client = getOAuthClient();
    client.setCredentials({ refresh_token: refreshToken });

    const calendar = google.calendar({ version: 'v3', auth: client });

    const event = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary,
        description,
        start: { dateTime: new Date(startTime).toISOString() },
        end: { dateTime: new Date(endTime).toISOString() },
        attendees: attendeeEmail ? [{ email: attendeeEmail }] : []
      }
    });

    return { success: true, eventId: event.data.id };
  } catch (err) {
    console.log('Calendar event creation failed:', err.message);
    return { success: false, error: err.message };
  }
};

const deleteCalendarEvent = async (refreshToken, eventId) => {
  if (!refreshToken || !eventId) return { success: false };

  // Simulated / Mock Calendar mode
  if (refreshToken.startsWith('demo_') || !isGoogleConfigured()) {
    console.log(`\n[GOOGLE CALENDAR SYNC] Event deleted: ${eventId}`);
    return { success: true };
  }

  try {
    const client = getOAuthClient();
    client.setCredentials({ refresh_token: refreshToken });

    const calendar = google.calendar({ version: 'v3', auth: client });

    await calendar.events.delete({
      calendarId: 'primary',
      eventId
    });

    return { success: true };
  } catch (err) {
    console.log('Calendar event deletion failed:', err.message);
    return { success: false, error: err.message };
  }
};

module.exports = {
  isGoogleConfigured,
  getAuthUrl,
  getTokensFromCode,
  createCalendarEvent,
  deleteCalendarEvent
};