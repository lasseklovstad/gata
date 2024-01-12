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
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException
import java.util.UUID

@RestController
@RequestMapping("api/responsibility")
class ResponsibilityRestController {
    @Autowired
    private lateinit var responsibilityRepository: ResponsibilityRepository

    @Autowired
    private lateinit var responsibilityYearRepository: ResponsibilityYearRepository

    @GetMapping
    @PreAuthorize("hasAuthority('member')")
    fun getResponsibilities(): List<DtoOutResponsibility> {
        return responsibilityRepository.findAll().map { DtoOutResponsibility(it) }
    }

    @GetMapping("{responsibilityId}")
    @PreAuthorize("hasAuthority('member')")
    fun getResponsibility(
        @PathVariable responsibilityId: String,
    ): DtoOutResponsibility {
        return responsibilityRepository.findById(UUID.fromString(responsibilityId))
            .orElseThrow { ResponsibilityNotFound(responsibilityId) }.let { DtoOutResponsibility(it) }
    }

    @PostMapping
    @PreAuthorize("hasAuthority('admin')")
    fun postResponsibility(
        @RequestBody body: DtoInnResponsibility,
    ) {
        responsibilityRepository.save(
            Responsibility(id = null, name = body.name, description = body.description, responsibilityYears = null),
        )
    }

    @PutMapping("{responsibilityId}")
    @PreAuthorize("hasAuthority('admin')")
    fun putResponsibility(
        @RequestBody body: DtoInnResponsibility,
        @PathVariable responsibilityId: String,
    ) {
        val responsibility =
            responsibilityRepository.findById(UUID.fromString(responsibilityId))
                .orElseThrow { ResponsibilityNotFound(responsibilityId) }
        responsibility.description = body.description
        responsibility.name = body.name
        responsibilityRepository.save(responsibility)
    }

    @DeleteMapping("{responsibilityId}")
    @PreAuthorize("hasAuthority('admin')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteResponsibility(
        @PathVariable responsibilityId: String,
    ) {
        val responsibility =
            responsibilityRepository.findById(UUID.fromString(responsibilityId))
                .orElseThrow { ResponsibilityNotFound(responsibilityId) }
        val responsibilityYears = responsibilityYearRepository.findResponsibilityYearsByResponsibility(responsibility)
        if (responsibilityYears.isNotEmpty()) {
            throw throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Ansvarsposten er i bruk")
        }
        responsibilityRepository.delete(responsibility)
    }
}
