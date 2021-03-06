package no.gata.web.controller

import com.fasterxml.jackson.databind.ObjectMapper
import no.gata.web.models.*
import no.gata.web.repository.GataReportFileRepository
import no.gata.web.repository.GataReportRepository
import no.gata.web.repository.GataRoleRepository
import no.gata.web.repository.GataUserRepository
import no.gata.web.service.CloudinaryService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.http.HttpStatus
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.mail.javamail.MimeMessageHelper
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException
import java.util.*
import javax.mail.internet.InternetAddress


data class GataReportPayload(
        var title: String,
        var description: String,
        var type: ReportType
)

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

    @GetMapping
    @PreAuthorize("hasAuthority('member')")
    fun getReports(@RequestParam page: Int, @RequestParam type: ReportType): Page<GataReportSimple> {
        val paging: Pageable = PageRequest.of(page, 10)
        return gataReportRepository.findAllByTypeOrderByCreatedDateDesc(type, paging)
    }

    @GetMapping("{id}")
    @PreAuthorize("hasAuthority('member')")
    fun getReport(@PathVariable id: String): Optional<GataReport> {
        return gataReportRepository.findById(UUID.fromString(id))
    }

    @GetMapping("databasesize")
    @PreAuthorize("hasAuthority('admin')")
    fun getDatabaseSize(): String {
        return gataReportRepository.getDatabaseSize()
    }

    @GetMapping("{id}/publish")
    @PreAuthorize("hasAuthority('member')")
    fun publishReport(@PathVariable id: String): List<String> {
        val siteBaseUrl = "https://gataersamla.herokuapp.com"
        val report = gataReportRepository.findById(UUID.fromString(id))
        val role = gataRoleRepository.findByName("Medlem")
        val members = gataUserRepository.findAllByRolesEquals(role.get()).filter { it.subscribe }
        if (members.isNotEmpty()) {
            val msg = javaMailSender.createMimeMessage()
            val helper = MimeMessageHelper(msg, true)
            helper.setTo(members.map { InternetAddress(it.email) }.toTypedArray())

            helper.setSubject("Nytt fra Gata! ${report.get().title}")
            helper.setText("<h1>Nytt fra Gata</h1><p>Det har kommet en oppdatering p?? ${siteBaseUrl}!</p><h2>${report.get().title}</h2>" +
                    "<p>${report.get().description}</p><p>" +
                    "<a href='${siteBaseUrl}/#/report/${report.get().id}'>Trykk her for ?? lese hele saken!</a>" +
                    "</p>", true)

            javaMailSender.send(msg)
        }
        return members.map { it.email }
    }

    @DeleteMapping("{id}")
    @PreAuthorize("hasAuthority('admin')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteReport(@PathVariable id: String) {
        val report = gataReportRepository.findById(UUID.fromString(id))
        if(report.isPresent){
            val reportFiles = gataReportFileRepository.findAllByReport(report.get())
            // Delete all files on cloud first
            deleteFiles(reportFiles)
            return gataReportRepository.deleteById(UUID.fromString(id))
        }
        throw ResponseStatusException(HttpStatus.NOT_FOUND, "Finner ikke referatet");
    }

    fun getLoggedInUser(authentication: Authentication): GataUser {
        val user = gataUserRepository.findByExternalUserProviderId(authentication.name)
        if (user.isPresent) {
            return user.get()
        }
        throw ResponseStatusException(HttpStatus.NOT_FOUND, "Brukeren finnes ikke!");
    }

    @PostMapping
    @PreAuthorize("hasAuthority('member')")
    fun createReport(@RequestBody body: GataReportPayload, authentication: Authentication): GataReport {
        val isAdmin = authentication.authorities.find { it.authority.equals("admin") }
        if (isAdmin == null && body.type == ReportType.DOCUMENT) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "Du har ikke tilgang til ?? opprette dokument!");
        }
        val user = getLoggedInUser(authentication)
        val report = GataReport(
                id = null, title = body.title,
                description = body.description,
                content = null,
                lastModifiedBy = user.name,
                createdDate = Date(),
                lastModifiedDate = Date(),
                createdBy = user,
                files = emptyList(), type = body.type)
        return gataReportRepository.save(report)
    }

    @PutMapping("{id}")
    @PreAuthorize("hasAuthority('member')")
    fun updateReport(@RequestBody body: GataReportPayload, authentication: Authentication, @PathVariable id: String): GataReport {
        val user = getLoggedInUser(authentication)
        val report = gataReportRepository.findById(UUID.fromString(id))
        if (report.isPresent) {
            val newReport = report.get()
            newReport.title = body.title
            newReport.description = body.description
            newReport.lastModifiedBy = user.name
            newReport.lastModifiedDate = Date()
            return gataReportRepository.save(newReport)
        }
        throw ResponseStatusException(HttpStatus.NOT_FOUND, "Finner ikke referatet");
    }

    @PutMapping("{id}/content")
    @PreAuthorize("hasAuthority('member')")
    fun updateReportContent(@RequestBody body: List<RichTextBlock>, authentication: Authentication, @PathVariable id: String): GataReport {
        val user = getLoggedInUser(authentication)
        val report = gataReportRepository.findById(UUID.fromString(id))
        if (report.isPresent) {
            val files = body.filter { it.type == "image" }
            val newReport = report.get()
            val reportFiles = gataReportFileRepository.findAllByReport(newReport)
            val filesToDelete = reportFiles.filter { files.find { file -> file.imageId == it.id.toString() } == null }
            deleteFiles(filesToDelete)
            newReport.content = ObjectMapper().writeValueAsString(body)
            newReport.lastModifiedBy = user.name
            newReport.lastModifiedDate = Date()
            return gataReportRepository.save(newReport)
        }
        throw ResponseStatusException(HttpStatus.NOT_FOUND, "Finner ikke referatet");
    }

    fun deleteFiles(files: List<GataId>){
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
