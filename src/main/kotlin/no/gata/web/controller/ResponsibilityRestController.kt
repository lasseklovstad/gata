package no.gata.web.controller

import no.gata.web.controller.dtoInn.DtoInnResponsibility
import no.gata.web.controller.dtoOut.DtoOutResponsibility
import no.gata.web.models.Responsibility
import no.gata.web.repository.ResponsibilityRepository
import no.gata.web.repository.ResponsibilityYearRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import java.time.Year

@RestController
@RequestMapping("api/responsibility")
class ResponsibilityRestController {
    @Autowired
    private lateinit var responsibilityRepository: ResponsibilityRepository

    @Autowired
    private lateinit var responsibilityYearRepository: ResponsibilityYearRepository

    @GetMapping
    @PreAuthorize("hasAuthority('member')")
    fun getResponsibilities(): List<Responsibility> {
        return responsibilityRepository.findAll();
    }

    @GetMapping("available")
    @PreAuthorize("hasAuthority('member')")
    fun getAvailableResponsibilities(@RequestParam("year") yearParam: String?): List<DtoOutResponsibility> {
        val allResponsibilities = responsibilityRepository.findAll();
        val year = if (yearParam == null) Year.now() else Year.of(yearParam.toInt());
        val responsibilityYears = responsibilityYearRepository.findResponsibilityYearsByYearEquals(year);
        return allResponsibilities
                .filter { responsibilityYears.find { responsibilityYear -> responsibilityYear.responsibility?.id == it.id } == null }
                .map { DtoOutResponsibility(it) }
    }

    @PostMapping
    @PreAuthorize("hasAuthority('admin')")
    fun postResponsibility(@RequestBody body: DtoInnResponsibility): DtoOutResponsibility {
        return DtoOutResponsibility(responsibilityRepository.save(
                Responsibility(id = null, name = body.name, description = body.description, responsibilityYears = null)
        ))
    }

    @PutMapping
    @PreAuthorize("hasAuthority('admin')")
    fun putResponsibility(@RequestBody body: Responsibility): DtoOutResponsibility {
        return DtoOutResponsibility(responsibilityRepository.save(body))
    }

    @DeleteMapping
    @PreAuthorize("hasAuthority('admin')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteResponsibility(@RequestBody body: Responsibility) {
        return responsibilityRepository.delete(
                body
        );
    }

}
