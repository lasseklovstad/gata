package no.gata.web.service

import no.gata.web.models.GataReport
import no.gata.web.models.GataReportSimple
import no.gata.web.repository.GataReportRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import java.util.*

@Service
class GataReportService {
    @Autowired
    private lateinit var gataReportRepository: GataReportRepository

    fun getReport(id: String): GataReport {
        return gataReportRepository.findById(UUID.fromString(id)).orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Finner ikke referatet") }
    }
}
