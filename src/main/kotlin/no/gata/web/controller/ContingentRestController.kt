package no.gata.web.controller

import no.gata.web.repository.*
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.mail.javamail.MimeMessageHelper
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.time.Year
import javax.mail.internet.InternetAddress

data class GataContingentInfo(
        var size: String,
        var bank: String
)

@RestController
@RequestMapping("api/contingent")
class ContingentRestController {

    @Value(value = "\${gata.contingent.bank}")
    private lateinit var contingentBank: String

    @Value(value = "\${gata.contingent.size}")
    private lateinit var contingentSize: String

    @Autowired
    private lateinit var gataUserRepository: GataUserRepository

    @Autowired
    private lateinit var gataRoleRepository: GataRoleRepository

    @Autowired
    private lateinit var javaMailSender: JavaMailSender

    @GetMapping("email")
    @PreAuthorize("hasAuthority('admin')")
    fun publishContigent(): List<String> {
        val role = gataRoleRepository.findByName("Medlem")
        val members = gataUserRepository.findAllByRolesEquals(role.get())
        val membersNotPaid = members.filter {
            it.contingents.find { cont -> cont.year.equals(Year.now()) }?.isPaid != true
        }
        if (membersNotPaid.isNotEmpty()) {
            val msg = javaMailSender.createMimeMessage()
            val helper = MimeMessageHelper(msg, true)
            helper.setTo(membersNotPaid.map { InternetAddress(it.email) }.toTypedArray())
            helper.setSubject("Du har ikke betalt Gata kontigenten!")
            helper.setText("<h1>Betal kontigent</h1><p>Du har ikke betalt kontigenten på ${contingentSize}kr til ${contingentBank}!</p>", true)

            javaMailSender.send(msg)
        }
        return membersNotPaid.map { it.email }
    }

    @GetMapping()
    @PreAuthorize("hasAuthority('member')")
    fun getContigent(): GataContingentInfo {
        return GataContingentInfo(size = contingentSize, bank = contingentBank)
    }
}
