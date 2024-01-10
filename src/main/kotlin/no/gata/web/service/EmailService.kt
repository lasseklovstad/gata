package no.gata.web.service

import com.sendgrid.Method
import com.sendgrid.Request
import com.sendgrid.SendGrid
import com.sendgrid.helpers.mail.Mail
import com.sendgrid.helpers.mail.objects.Content
import com.sendgrid.helpers.mail.objects.Email
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.io.IOException

@Service
class EmailService(private val sendGrid: SendGrid) {

    private var logger = LoggerFactory.getLogger(EmailService::class.java)

    fun sendTextEmail(toEmail: String, subject: String, emailContent: String) {
        val from = Email("hesten.bla@gataersamla.no", "Hesten Blå")
        val to = Email(toEmail)
        val content = Content("text/html", emailContent)
        val mail = Mail(from, subject, to, content)

        val request = Request()
        try {
            request.method = Method.POST
            request.endpoint = "mail/send"
            request.body = mail.build()
            val response = sendGrid.api(request)

            if(response.statusCode != 202){
                logger.error(
                    "Email could not be sent with statusCode:${response.statusCode} ${response.body}"
                )
            }
        } catch (ex: IOException) {
            logger.error("Something went wrong when sending email", ex)
        }
    }
}
