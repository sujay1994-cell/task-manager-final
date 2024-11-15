const { google } = require('googleapis');
const User = require('../models/User');
const { createNotification } = require('./notificationUtils');

// Configure Google Calendar API
const calendar = google.calendar({
  version: 'v3',
  auth: process.env.GOOGLE_API_KEY
});

const calendarUtils = {
  // Create calendar event
  createCalendarEvent: async ({
    title,
    date,
    recipients,
    details,
    duration = 60, // default duration in minutes
    sendInvites = true
  }) => {
    try {
      // Get recipient emails
      const users = await User.find({ _id: { $in: recipients } })
        .select('email calendarId');

      const event = {
        summary: title,
        description: details,
        start: {
          dateTime: new Date(date).toISOString(),
          timeZone: 'UTC'
        },
        end: {
          dateTime: new Date(date.getTime() + duration * 60000).toISOString(),
          timeZone: 'UTC'
        },
        attendees: users.map(user => ({ email: user.email })),
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 1 day before
            { method: 'popup', minutes: 30 } // 30 minutes before
          ]
        }
      };

      // Create event
      const response = await calendar.events.insert({
        calendarId: 'primary',
        resource: event,
        sendUpdates: sendInvites ? 'all' : 'none'
      });

      // Store event ID for each user
      await Promise.all(users.map(user => 
        User.findByIdAndUpdate(user._id, {
          $push: { calendarEvents: response.data.id }
        })
      ));

      // Send notifications
      if (sendInvites) {
        await createNotification({
          type: 'CALENDAR_EVENT',
          title: 'New Calendar Event',
          message: `New event scheduled: ${title}`,
          recipients,
          data: {
            eventId: response.data.id,
            eventDate: date
          }
        });
      }

      return response.data;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw error;
    }
  },

  // Update calendar event
  updateCalendarEvent: async (eventId, updates) => {
    try {
      const response = await calendar.events.patch({
        calendarId: 'primary',
        eventId,
        resource: updates,
        sendUpdates: 'all'
      });

      return response.data;
    } catch (error) {
      console.error('Error updating calendar event:', error);
      throw error;
    }
  },

  // Delete calendar event
  deleteCalendarEvent: async (eventId) => {
    try {
      await calendar.events.delete({
        calendarId: 'primary',
        eventId,
        sendUpdates: 'all'
      });

      // Remove event ID from users
      await User.updateMany(
        { calendarEvents: eventId },
        { $pull: { calendarEvents: eventId } }
      );

      return true;
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      throw error;
    }
  },

  // Get user's calendar events
  getUserEvents: async (userId, timeMin = new Date()) => {
    try {
      const user = await User.findById(userId).select('calendarEvents');
      
      if (!user.calendarEvents?.length) return [];

      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: timeMin.toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
        q: user.calendarEvents.join(' OR ')
      });

      return response.data.items;
    } catch (error) {
      console.error('Error fetching user events:', error);
      throw error;
    }
  }
};

module.exports = calendarUtils; 