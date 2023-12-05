package no.gata.web.controller

import no.gata.web.controller.dtoInn.DtoInnResponsibility
import no.gata.web.controller.dtoOut.DtoOutResponsibility
import no.gata.web.exception.ResponsibilityNotFound
import no.gata.web.models.Responsibility
import no.gata.web.repository.ResponsibilityRepository
import no.gata.web.repository.ResponsibilityYearRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import org.springframework.web.client.HttpClientErrorException.BadRequest
import org.springframework.web.server.ResponseStatusException
import java.time.Year
import java.util.*

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

    @GetMapping("{responsibilityId}")
    @PreAuthorize("hasAuthority('member')")
    fun getResponsibility(@PathVariable responsibilityId: String): Responsibility {
        return responsibilityRepository.findById(UUID.fromString(responsibilityId)).orElseThrow { ResponsibilityNotFound(responsibilityId) }
    }

    @PostMapping
    @PreAuthorize("hasAuthority('admin')")
    fun postResponsibility(@RequestBody body: DtoInnResponsibility) {
        responsibilityRepository.save(
                Responsibility(id = null, name = body.name, description = body.description, responsibilityYears = null)
        )
    }

    @PutMapping("{responsibilityId}")
    @PreAuthorize("hasAuthority('admin')")
    fun putResponsibility(@RequestBody body: DtoInnResponsibility, @PathVariable responsibilityId: String) {
        val responsibility = responsibilityRepository.findById(UUID.fromString(responsibilityId)).orElseThrow { ResponsibilityNotFound(responsibilityId) }
        responsibility.description = body.description
        responsibility.name = body.name
        responsibilityRepository.save(responsibility)
    }

    @DeleteMapping("{responsibilityId}")
    @PreAuthorize("hasAuthority('admin')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteResponsibility(@PathVariable responsibilityId: String) {
        val responsibility = responsibilityRepository.findById(UUID.fromString(responsibilityId)).orElseThrow { ResponsibilityNotFound(responsibilityId) }
        val responsibilityYears  = responsibilityYearRepository.findResponsibilityYearsByResponsibility(responsibility)
        if(responsibilityYears.isNotEmpty()){
            throw throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Ansvarsposten er i bruk")
        }
        responsibilityRepository.delete(responsibility)
    }

}
