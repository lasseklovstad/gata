package no.gata.web.controller

import com.fasterxml.jackson.databind.ObjectMapper
import jakarta.mail.internet.InternetAddress
import no.gata.web.controller.dtoInn.DtoInnGataReport
import no.gata.web.controller.dtoOut.DtoOutGataReport
import no.gata.web.controller.dtoOut.DtoOutGataReportSimple
import no.gata.web.exception.GataUserNotFound
import no.gata.web.models.*
import no.gata.web.repository.GataReportFileRepository
import no.gata.web.repository.GataReportRepository
import no.gata.web.repository.GataRoleRepository
import no.gata.web.repository.GataUserRepository
import no.gata.web.service.CloudinaryService
import no.gata.web.service.GataReportService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.http.HttpStatus
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.mail.javamail.MimeMessageHelper
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException
import java.util.*


@RestController
@RequestMapping("api/report")
class GataReportRestController {

    @Autowired
    private lateinit var gataReportRepository: GataReportRepository

    @Autowired
    private lateinit var gataUserRepository: GataUserRepository

    @Autowired
    private lateinit var gataReportFileRepository: GataReportFileRepository

    @Autowired
    private lateinit var javaMailSender: JavaMailSender

    @Autowired
    private lateinit var gataRoleRepository: GataRoleRepository

    @Autowired
    private lateinit var cloudinaryService: CloudinaryService

    @Autowired
    private lateinit var gataReportService: GataReportService

    @GetMapping()
    @PreAuthorize("hasAuthority('member')")
    @Transactional
    fun getReports(@RequestParam page: Int, @RequestParam type: ReportType): Page<DtoOutGataReport> {
        val paging: Pageable = PageRequest.of(page, 10)
        val page = gataReportRepository.findAllByTypeOrderByCreatedDateDesc(type, paging)
        val detailedPage = page.map { DtoOutGataReport(it) }
        return detailedPage
    }

    @GetMapping("simple")
    @PreAuthorize("hasAuthority('member')")
    @Transactional
    fun getReportsSimple(@RequestParam page: Int, @RequestParam type: ReportType): Page<DtoOutGataReportSimple> {
        val paging: Pageable = PageRequest.of(page, 10)
        val page = gataReportRepository.findAllByTypeOrderByCreatedDateDesc(type, paging)
        val simplePage = page.map { DtoOutGataReportSimple(it) }
        return simplePage
    }

    @GetMapping("{id}/simple")
    @PreAuthorize("hasAuthority('member')")
    fun getReportSimple(@PathVariable id: String): DtoOutGataReportSimple {
        return DtoOutGataReportSimple(gataReportService.getReport(id))
    }

    @GetMapping("{id}")
    @PreAuthorize("hasAuthority('member')")
    fun getReport(@PathVariable id: String): DtoOutGataReport {
        return DtoOutGataReport(gataReportService.getReport(id))
    }

    @GetMapping("databasesize")
    @PreAuthorize("hasAuthority('member')")
    fun getDatabaseSize(): String {
        return gataReportRepository.getDatabaseSize()
    }

    @GetMapping("publishemails")
    @PreAuthorize("hasAuthority('member')")
    fun getEmailsToPublishReport(): List<String> {
        val role = gataRoleRepository.findByName("Medlem")
        val members = gataUserRepository.findAllByRolesEquals(role.get())
                .filter { it.subscribe }
                .mapNotNull { it.getPrimaryUser() }
        return members.map { it.email }
    }

    @GetMapping("{id}/publish")
    @PreAuthorize("hasAuthority('member')")
    fun publishReport(@PathVariable id: String): List<String> {
        val siteBaseUrl = "https://gataersamla.no"
        val report = gataReportService.getReport(id)
        val emails = getEmailsToPublishReport()
        if (emails.isNotEmpty()) {
            val msg = javaMailSender.createMimeMessage()
            val helper = MimeMessageHelper(msg, true)
            helper.setTo(emails.map { InternetAddress(it) }.toTypedArray())

            helper.setSubject("Nytt fra Gata! ${report.title}")
            helper.setText("<h1>Nytt fra Gata</h1><p>Det har kommet en oppdatering på ${siteBaseUrl}!</p><h2>${report.title}</h2>" +
                    "<p>${report.description}</p><p>" +
                    "<a href='${siteBaseUrl}/reportInfo/${report.id}'>Trykk her for å lese hele saken!</a>" +
                    "</p>", true)

            javaMailSender.send(msg)
        }
        return emails
    }

    @DeleteMapping("{id}")
    @PreAuthorize("hasAuthority('member')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteReport(@PathVariable id: String) {
        val report = gataReportService.getReport(id)
        val reportFiles = gataReportFileRepository.findAllByReport(report)
        // Delete all files on cloud first
        deleteFiles(reportFiles)
        return gataReportRepository.deleteById(UUID.fromString(id))
    }

    fun getLoggedInUser(authentication: Authentication): GataUser {
        return gataUserRepository.findByExternalUserProvidersId(authentication.name).orElseThrow { GataUserNotFound(authentication.name) }
    }

    @PostMapping
    @PreAuthorize("hasAuthority('member')")
    fun createReport(@RequestBody body: DtoInnGataReport, authentication: Authentication): DtoOutGataReportSimple {
        val isAdmin = authentication.authorities.find { it.authority.equals("admin") }
        if (isAdmin == null && body.type == ReportType.DOCUMENT) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "Du har ikke tilgang til å opprette dokument!");
        }
        val user = getLoggedInUser(authentication)
        val report = GataReport(
                id = null, title = body.title,
                description = body.description,
                content = null,
                lastModifiedBy = user.getPrimaryUser()!!.name,
                createdDate = Date(),
                lastModifiedDate = Date(),
                createdBy = user,
                files = emptyList(), type = body.type)
        return DtoOutGataReportSimple(gataReportRepository.save(report))
    }

    @PutMapping("{id}")
    @PreAuthorize("hasAuthority('member')")
    fun updateReport(@RequestBody body: DtoInnGataReport, authentication: Authentication, @PathVariable id: String): DtoOutGataReport {
        val user = getLoggedInUser(authentication)
        val report = gataReportService.getReport(id)

        report.title = body.title
        report.description = body.description
        report.lastModifiedBy = user.getPrimaryUser()!!.name
        report.lastModifiedDate = Date()
        return DtoOutGataReport(gataReportRepository.save(report))
    }

    @PutMapping("{id}/content")
    @PreAuthorize("hasAuthority('member')")
    fun updateReportContent(@RequestBody body: List<RichTextBlock>, authentication: Authentication, @PathVariable id: String): DtoOutGataReport {
        val user = getLoggedInUser(authentication)
        val report = gataReportService.getReport(id)
        val files = body.filter { it.type == "image" }
        val reportFiles = gataReportFileRepository.findAllByReport(report)
        val filesToDelete = reportFiles.filter { files.find { file -> file.imageId == it.id.toString() } == null }
        deleteFiles(filesToDelete)
        report.content = ObjectMapper().writeValueAsString(body)
        report.lastModifiedBy = user.getPrimaryUser()!!.name
        report.lastModifiedDate = Date()
        return DtoOutGataReport(gataReportRepository.save(report))

    }

    fun deleteFiles(files: List<GataId>) {
        files.forEach { fileId ->
            val file = gataReportFileRepository.findById(fileId.id)
            if (file.isPresent) {
                val reportFile = file.get();
                if (reportFile.cloudId != null) {
                    cloudinaryService.deleteFile(reportFile.cloudId!!)
                }
                gataReportFileRepository.deleteById(fileId.id)
            }

        }
    }
}
