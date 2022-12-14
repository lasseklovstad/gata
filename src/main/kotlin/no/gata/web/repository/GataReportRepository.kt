package no.gata.web.repository

import no.gata.web.models.GataReport
import no.gata.web.models.GataReportSimple
import no.gata.web.models.ReportType
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.PagingAndSortingRepository
import java.util.*


interface GataReportRepository: PagingAndSortingRepository<GataReport, UUID>, JpaRepository<GataReport, UUID> {
    fun findAllByTypeOrderByCreatedDateDesc(type: ReportType,pageable: Pageable): Page<GataReportSimple>
    @Query(
            value = "SELECT pg_database_size(current_database())/1024/1024",
            nativeQuery = true)
    fun getDatabaseSize(): String
}
