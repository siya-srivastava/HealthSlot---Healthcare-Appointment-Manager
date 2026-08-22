const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');
const { getAuthUrl, getTokensFromCode, isGoogleConfigured } = require('../services/calendarService');

router.get('/connect', protect, (req, res) => {
  try {
    const isConfig = isGoogleConfigured();
    const url = getAuthUrl(req.user.id);
    res.json({
      authUrl: url,
      isConfigured: isConfig
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to generate Google Calendar auth URL', error: err.message });
  }
});

router.post('/connect-demo', protect, async (req, res) => {
  try {
    const demoToken = `demo_google_refresh_token_${Date.now()}`;
    await User.findByIdAndUpdate(req.user.id, { googleRefreshToken: demoToken });
    res.json({
      message: 'Demo Google Calendar connected successfully!',
      isConnected: true
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to enable demo calendar sync', error: err.message });
  }
});

router.get('/status', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      isConnected: Boolean(user?.googleRefreshToken),
      isGoogleConfigured: isGoogleConfigured(),
      email: user?.email
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch calendar status', error: err.message });
  }
});

router.post('/disconnect', protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { googleRefreshToken: null });
    res.json({ message: 'Google Calendar disconnected successfully', isConnected: false });
  } catch (err) {
    res.status(500).json({ message: 'Failed to disconnect calendar', error: err.message });
  }
});

router.get('/oauth/callback', async (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  try {
    const { code, state, error } = req.query;

    if (error || !code) {
      return res.redirect(`${frontendUrl}/calendar-callback?status=error&message=${encodeURIComponent(error || 'No authorization code received')}`);
    }

    const tokens = await getTokensFromCode(code);

    if (tokens && tokens.refresh_token && state) {
      await User.findByIdAndUpdate(state, { googleRefreshToken: tokens.refresh_token });
    }

    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Google Calendar Connected</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f8fafc; color: #0f172a; }
            .card { background: white; padding: 2.5rem; border-radius: 1rem; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); text-align: center; max-width: 420px; }
            .btn { display: inline-block; margin-top: 1.5rem; background: #0F766E; color: white; padding: 0.75rem 1.5rem; border-radius: 0.5rem; text-decoration: none; font-weight: bold; }
            .icon { font-size: 3rem; color: #0F766E; margin-bottom: 1rem; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="icon">✓</div>
            <h2>Google Calendar Connected!</h2>
            <p>Your Google Calendar is now synced with HealthSlot. Appointments will be added to your calendar automatically.</p>
            <a href="${frontendUrl}" class="btn">Return to Application</a>
          </div>
          <script>
            setTimeout(() => {
              if (window.opener) {
                window.opener.postMessage({ type: 'CALENDAR_CONNECTED' }, '*');
                window.close();
              } else {
                window.location.href = '${frontendUrl}';
              }
            }, 2500);
          </script>
        </body>
      </html>
    `);
  } catch (err) {
    res.redirect(`${frontendUrl}/calendar-callback?status=error&message=${encodeURIComponent(err.message)}`);
  }
});

module.exports = router;