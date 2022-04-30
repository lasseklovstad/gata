package no.gata.web.repository

import no.gata.web.models.GataReport
import no.gata.web.models.GataReportSimple
import org.springframework.data.jpa.repository.JpaRepository
import java.util.*


interface GataReportRepository: JpaRepository<GataReport, UUID> {

    fun findAllByOrderByCreatedDateAsc(): List<GataReportSimple>
}
