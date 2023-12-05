package no.gata.web.controller

import no.gata.web.controller.dtoOut.DtoOutGataContingentInfo
import no.gata.web.repository.*
import no.gata.web.service.EmailService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.time.Year

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
    private lateinit var emailService: EmailService

    @GetMapping("email")
    @PreAuthorize("hasAuthority('admin')")
    fun publishContigent(): List<String> {
        val role = gataRoleRepository.findByName("Medlem")
        val members = gataUserRepository.findAllByRolesEquals(role.get())
        val membersNotPaid = members.filter {
            it.contingents.find { cont -> cont.year.equals(Year.now().value) }?.isPaid != true
        }.mapNotNull { it.getPrimaryUser() }
        if (membersNotPaid.isNotEmpty()) {
            membersNotPaid.forEach {
                emailService.sendTextEmail(
                    it.email,
                    "Du har ikke betalt Gata kontigenten!",
                    "<h1>Betal kontigent</h1><p>Du har ikke betalt kontigenten på ${contingentSize}kr til ${contingentBank}!</p>"
                )
            }

        }
        return membersNotPaid.map { it.email }
    }

    @GetMapping()
    @PreAuthorize("hasAuthority('member')")
    fun getContigent(): DtoOutGataContingentInfo {
        return DtoOutGataContingentInfo(size = contingentSize, bank = contingentBank)
    }
}
