using MailKit.Net.Smtp;
using MimeKit;
using BookHeaven.Services.Interfaces;

namespace BookHeaven.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;

        public EmailService(IConfiguration config)
        {
            _config = config;
        }

        public async Task SendClaimCodeEmailAsync(string toEmail, string memberName, string claimCode, decimal totalAmount)
        {
            try
            {
                var message = new MimeMessage();
                message.From.Add(MailboxAddress.Parse(_config["Email:From"]));
                message.To.Add(MailboxAddress.Parse(toEmail));
                message.Subject = "📦 BookHeaven Order Confirmation";

                message.Body = new TextPart("html")
                {
                    Text = $@"<h2>Hi {memberName},</h2>
                            <p>Thanks for placing your order at <strong>BookHeaven</strong>!</p>
                            <p>Your claim code is: <strong>{claimCode}</strong></p>
                            <p>Total Amount: <strong>NPR {totalAmount:F2}</strong></p>
                            <p>Please present your membership ID and claim code at pickup.</p>
                            <br><p>Happy Reading! 📚</p>"
                };

                using var smtp = new SmtpClient();
                await smtp.ConnectAsync(_config["Email:Smtp"], 587, false);
                await smtp.AuthenticateAsync(_config["Email:Username"], _config["Email:Password"]);
                await smtp.SendAsync(message);
                await smtp.DisconnectAsync(true);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[EmailService] Failed to send email to {toEmail}: {ex.Message}\n{ex.StackTrace}");
                throw; // Optionally rethrow to propagate the error
            }
        }
    }
}