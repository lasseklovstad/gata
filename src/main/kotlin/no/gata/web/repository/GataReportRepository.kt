package no.gata.web.repository

import no.gata.web.models.GataReport
import no.gata.web.models.GataUser
import no.gata.web.models.ReportType
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.repository.PagingAndSortingRepository
import java.util.UUID

interface GataReportRepository : PagingAndSortingRepository<GataReport, UUID>, JpaRepository<GataReport, UUID> {
    fun findAllByTypeOrderByCreatedDateDesc(
        type: ReportType,
        pageable: Pageable,
    ): Page<GataReport>

    fun findAllByCreatedBy(user: GataUser): List<GataReport>
}
