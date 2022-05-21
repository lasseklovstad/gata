package no.gata.web.repository

import no.gata.web.models.GataReport
import no.gata.web.models.GataReportSimple
import no.gata.web.models.ReportType
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.repository.PagingAndSortingRepository
import java.util.*


interface GataReportRepository: PagingAndSortingRepository<GataReport, UUID> {
    fun findAllByTypeOrderByCreatedDateDesc(type: ReportType,pageable: Pageable): Page<GataReportSimple>
}
