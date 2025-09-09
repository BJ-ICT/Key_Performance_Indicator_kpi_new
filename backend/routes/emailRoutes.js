import express from "express";
const router = express.Router();
import EmailRecipient from "../models/emailRecipient.js";
import nodemailer from 'nodemailer';
import cron from 'node-cron';

// Add a new email recipient
router.post('/add-recipient', async (req, res) => {
    try {
        const { email } = req.body;
        const newRecipient = new EmailRecipient({ email });
        await newRecipient.save();
        res.status(201).json({ message: 'Recipient added successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error adding recipient.', error });
    }
});

// Get all recipients
router.get('/recipients', async (req, res) => {
    try {
        const recipients = await EmailRecipient.find();
        res.status(200).json(recipients);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching recipients.', error });
    }
});

// Update an email recipient
router.put('/update-recipient/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { email } = req.body;

        const updatedRecipient = await EmailRecipient.findByIdAndUpdate(id, { email }, { new: true });
        if (!updatedRecipient) {
            return res.status(404).json({ message: 'Recipient not found.' });
        }

        res.status(200).json({ message: 'Recipient updated successfully.', recipient: updatedRecipient });
    } catch (error) {
        res.status(500).json({ message: 'Error updating recipient.', error });
    }
});

// Delete an email recipient
router.delete('/delete-recipient/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const deletedRecipient = await EmailRecipient.findByIdAndDelete(id);
        if (!deletedRecipient) {
            return res.status(404).json({ message: 'Recipient not found.' });
        }

        res.status(200).json({ message: 'Recipient deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting recipient.', error });
    }
});

// Function to send emails
const sendEmails = async () => {
    try {
        const recipients = await EmailRecipient.find();
        const recipientEmails = recipients.map((recipient) => recipient.email);

        if (recipientEmails.length === 0) {
            console.log('No recipients found.');
            return;
        }

        // Configure Nodemailer (without authentication)
        const transporter = nodemailer.createTransport({
            service: 'SMTP',  // This still needs an SMTP service
            // No auth section here
        });

        // Email details
        const mailOptions = {
            from: 'nwkpi@slt.com.lk',  // Sender email
            to: recipientEmails,
            subject: 'Monthly KPI Report',
            html: `
                <div style="text-align: left;">
                    <p>Dear All,</p>
                    <br></br>
                
                    <p>Your Monthly KPI Report is Updated. You can access the report using the link below:</p>
        
                    <p><strong><a href="INSERT_LINK_HERE">Access the KPI Report</a></strong></p>
                    <br></br>
        
                    <p>Thank you</p>
                    <p style="font-size: 10px; font-style: italic;">(Please note, this is an automated notification, and replies to this email will not be monitored.)</p>
                </div>
            `,
        };

        // Send email
        await transporter.sendMail(mailOptions);
        console.log('Emails sent successfully.');
    } catch (error) {
        console.error('Error sending emails:', error);
    }
};

// Schedule the task to run on the 10th of every month at 9:00 AM
cron.schedule('12 13 31 * *', () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth(); // Returns 0 for January, 1 for February, etc.

    console.log(`Running the scheduled task to send emails for month ${currentMonth + 1}.`);
    sendEmails();
});

export default router;
