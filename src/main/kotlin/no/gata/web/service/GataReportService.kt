package no.gata.web.service

import com.fasterxml.jackson.databind.ObjectMapper
import no.gata.web.controller.dtoInn.DtoInnGataReport
import no.gata.web.models.ExternalUser
import no.gata.web.models.GataId
import no.gata.web.models.GataReport
import no.gata.web.models.GataUser
import no.gata.web.models.ReportType
import no.gata.web.models.RichTextBlock
import no.gata.web.repository.GataReportFileRepository
import no.gata.web.repository.GataReportRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import java.util.Date
import java.util.UUID

@Service
class GataReportService {
    @Autowired
    private lateinit var gataReportRepository: GataReportRepository

    @Autowired
    private lateinit var gataReportFileRepository: GataReportFileRepository

    @Autowired
    private lateinit var cloudinaryService: CloudinaryService

    fun getReport(reportId: String): GataReport {
        return gataReportRepository.findById(UUID.fromString(reportId))
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Finner ikke referatet") }
    }

    fun getReports(
        type: ReportType,
        paging: Pageable,
    ): Page<GataReport> {
        return gataReportRepository.findAllByTypeOrderByCreatedDateDesc(type, paging)
    }

    fun updateReport(
        reportId: String,
        body: DtoInnGataReport,
        lastModifiedBy: ExternalUser?,
    ): GataReport {
        val report = getReport(reportId)
        report.title = body.title
        report.description = body.description
        report.lastModifiedBy = lastModifiedBy?.name
        report.lastModifiedDate = Date()
        return gataReportRepository.save(report)
    }

    fun updateReportContent(
        reportId: String,
        body: List<RichTextBlock>,
        lastModifiedBy: ExternalUser?,
    ): GataReport {
        val report = getReport(reportId)
        val files = body.filter { it.type == "image" }
        val reportFiles = gataReportFileRepository.findAllByReport(report)
        val filesToDelete = reportFiles.filter { files.find { file -> file.imageId == it.id.toString() } == null }
        deleteFiles(filesToDelete)
        report.content = ObjectMapper().writeValueAsString(body)
        report.lastModifiedBy = lastModifiedBy?.name
        report.lastModifiedDate = Date()
        return gataReportRepository.save(report)
    }

    fun updateReportMarkdown(
        reportId: String,
        markdown: String,
        lastModifiedBy: ExternalUser?,
    ): GataReport {
        val report = getReport(reportId)
        report.markdown = markdown
        report.lastModifiedBy = lastModifiedBy?.name
        report.lastModifiedDate = Date()
        return gataReportRepository.save(report)
    }

    fun createReport(
        user: GataUser,
        body: DtoInnGataReport,
    ): GataReport {
        val report =
            GataReport(
                id = null, title = body.title,
                description = body.description,
                content = null,
                lastModifiedBy = user.getPrimaryUser()?.name,
                createdDate = Date(),
                lastModifiedDate = Date(),
                createdBy = user,
                files = emptyList(), type = body.type,
            )
        return gataReportRepository.save(report)
    }

    fun deleteReport(reportId: String) {
        val report = getReport(reportId)
        val reportFiles = gataReportFileRepository.findAllByReport(report)
        // Delete all files on cloud first
        deleteFiles(reportFiles)
        return gataReportRepository.deleteById(UUID.fromString(reportId))
    }

    private fun deleteFiles(files: List<GataId>) {
        files.forEach { fileId ->
            val file = gataReportFileRepository.findById(fileId.id)
            if (file.isPresent) {
                val reportFile = file.get()
                if (reportFile.cloudId != null) {
                    cloudinaryService.deleteFile(reportFile.cloudId!!)
                }
                gataReportFileRepository.deleteById(fileId.id)
            }
        }
    }
}
