package no.gata.web.repository

import no.gata.web.models.GataId
import no.gata.web.models.GataReport
import no.gata.web.models.GataReportFile
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface GataReportFileRepository : JpaRepository<GataReportFile, UUID> {
    fun findAllByReport(report: GataReport): List<GataId>
}
