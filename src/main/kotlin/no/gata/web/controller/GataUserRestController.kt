package no.gata.web.controller

import no.gata.web.controller.dtoInn.DtoInnContingent
import no.gata.web.controller.dtoInn.DtoInnGataUser
import no.gata.web.controller.dtoInn.DtoInnResponsibilityNote
import no.gata.web.controller.dtoInn.DtoInnResponsibilityYear
import no.gata.web.controller.dtoOut.DtoOutGataContingent
import no.gata.web.controller.dtoOut.DtoOutGataUser
import no.gata.web.controller.dtoOut.DtoOutResponsibilityYear
import no.gata.web.exception.GataUserNoSufficientRole
import no.gata.web.models.GataContingent
import no.gata.web.models.GataUser
import no.gata.web.models.ResponsibilityNote
import no.gata.web.models.ResponsibilityYear
import no.gata.web.models.UserRoleName
import no.gata.web.repository.ExternalUserRepository
import no.gata.web.repository.GataContingentRepository
import no.gata.web.repository.GataRoleRepository
import no.gata.web.repository.GataUserRepository
import no.gata.web.repository.ResponsibilityNoteRepository
import no.gata.web.repository.ResponsibilityRepository
import no.gata.web.repository.ResponsibilityYearRepository
import no.gata.web.service.GataUserService
import no.gata.web.service.RoleService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpStatus
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken
import org.springframework.transaction.annotation.Transactional
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
import java.util.Date
import java.util.UUID

@RestController
@RequestMapping("api/user")
class GataUserRestController {
    @Autowired
    private lateinit var gataUserRepository: GataUserRepository

    @Autowired
    private lateinit var responsibilityYearRepository: ResponsibilityYearRepository

    @Autowired
    private lateinit var responsibilityNoteRepository: ResponsibilityNoteRepository

    @Autowired
    private lateinit var responsibilityRepository: ResponsibilityRepository

    @Autowired
    private lateinit var gataRoleRepository: GataRoleRepository

    @Autowired
    private lateinit var gataContingentRepository: GataContingentRepository

    @Autowired
    lateinit var roleService: RoleService

    @Autowired
    lateinit var externalUserRepository: ExternalUserRepository

    @Autowired
    lateinit var gataUserService: GataUserService

    @Value(value = "\${gata.make.first.user.admin}")
    private lateinit var makeFirstUserAdmin: String

    @GetMapping
    @PreAuthorize("hasAuthority('member')")
    fun getUsers(authentication: JwtAuthenticationToken): List<DtoOutGataUser> {
        val isAdmin = gataUserService.getLoggedInUser(authentication).getIsUserAdmin()
        if (isAdmin) {
            return gataUserRepository.findAll().map { DtoOutGataUser(it) }
        }
        val role = gataRoleRepository.findByRoleName(UserRoleName.Member)
        return gataUserRepository.findAllByRolesEquals(role.get()).map { DtoOutGataUser(it) }
    }

    @PostMapping
    @PreAuthorize("hasAuthority('admin')")
    fun postUser(
        @RequestBody body: DtoInnGataUser,
    ) {
        val externalUser = gataUserService.findExternalUser(body.externalUserId)
        gataUserService.createNewGataUser(externalUser, null)
    }

    @PostMapping("loggedin/create")
    fun postCreateExternalUserIfNotCreated(authentication: JwtAuthenticationToken) {
        val externalUser = gataUserService.findOrCreateNewExternalUser(authentication)
        // Todo: Finn ut om man trenger å hente data fra auth0 igjen for å oppdatere bilde eller liknende
        if (makeFirstUserAdmin == "true" && !gataUserRepository.findAll().any()) {
            gataUserService.createNewGataUser(externalUser, UserRoleName.Admin)
        }
    }

    @GetMapping("loggedin")
    fun getLoggedInUser(authentication: JwtAuthenticationToken): DtoOutGataUser {
        val user = gataUserService.getLoggedInUser(authentication)
        return DtoOutGataUser(user)
    }

    @GetMapping("{id}")
    @PreAuthorize("hasAuthority('member')")
    fun getUser(
        @PathVariable id: String,
    ): DtoOutGataUser? {
        return DtoOutGataUser(gataUserService.getUser(id))
    }

    @DeleteMapping("{id}")
    @PreAuthorize("hasAuthority('admin')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    fun deleteUser(
        authentication: JwtAuthenticationToken,
        @PathVariable id: String,
    ) {
        val loggedInUser = gataUserService.getLoggedInUser(authentication)
        if (id == loggedInUser.id?.toString()) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Du kan ikke slette deg selv!")
        }

        val gataUser = gataUserService.getUser(id)
        roleService.deleteAllRoles(gataUser)
        // Remove link to external user
        gataUser.externalUserProviders =
            gataUser.externalUserProviders.map {
                it.user = null
                it.primary = false
                it
            }
        for (report in gataUser.reports) {
            report.createdBy = null
        }

        gataUserRepository.save(gataUser)
        // Delete user
        gataUserRepository.delete(gataUser)
    }

    @GetMapping("{id}/responsibilityyear")
    @PreAuthorize("hasAuthority('member')")
    fun getResponsibilitiesByUserId(
        @PathVariable id: String,
    ): List<DtoOutResponsibilityYear> {
        val user = gataUserService.getUser(id)
        return responsibilityYearRepository.findResponsibilityYearsByUser(user).map { DtoOutResponsibilityYear(it) }
    }

    private fun validateUserIsMember(user: GataUser) {
        if (user.getIsUserMember()) {
            return
        } else {
            throw GataUserNoSufficientRole("medlem")
        }
    }

    @DeleteMapping("{id}/responsibilityyear/{responsibilityYearId}")
    @PreAuthorize("hasAuthority('admin')")
    fun removeResponsibilityForUser(
        @PathVariable responsibilityYearId: String,
        @PathVariable id: String,
    ): List<DtoOutResponsibilityYear> {
        val user = gataUserService.getUser(id)
        validateUserIsMember(user)
        val responsibilityYear = responsibilityYearRepository.findById(UUID.fromString(responsibilityYearId)).get()
        val note = responsibilityYear.note
        if (note != null) {
            responsibilityNoteRepository.delete(note)
        }
        responsibilityYearRepository.delete(responsibilityYear)

        return responsibilityYearRepository.findResponsibilityYearsByUser(user).map { DtoOutResponsibilityYear(it) }
    }

    @PostMapping("{id}/responsibilityyear")
    @PreAuthorize("hasAuthority('admin')")
    fun createResponsibilityForUser(
        @PathVariable id: String,
        @RequestBody responsibilityYearPayload: DtoInnResponsibilityYear,
    ): List<DtoOutResponsibilityYear> {
        val user = gataUserService.getUser(id)
        val year = responsibilityYearPayload.year
        validateUserIsMember(user)
        val responsibility =
            responsibilityRepository.findById(UUID.fromString(responsibilityYearPayload.responsibilityId)).get()
        val responsibilityYearCheck =
            responsibilityYearRepository.findResponsibilityYearsByUserAndYearAndResponsibility(
                user,
                year,
                responsibility,
            )
        if (responsibilityYearCheck.isNotEmpty()) {
            throw ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Bruker har allerede denne ansvarsposten for dette året.",
            )
        }

        val responsibilityYear =
            ResponsibilityYear(id = null, year = year, user = user, responsibility = responsibility, note = null)
        val note =
            ResponsibilityNote(
                id = null,
                lastModifiedDate = Date(),
                lastModifiedBy = user.getPrimaryUser()!!.name,
                text = "",
                responsibilityYear = responsibilityYear,
            )
        responsibilityYear.note = note
        responsibilityYearRepository.save(responsibilityYear)

        return responsibilityYearRepository.findResponsibilityYearsByUser(user).map { DtoOutResponsibilityYear(it) }
    }

    @PutMapping("{id}/responsibilityyear/{responsibilityYearId}/note")
    @PreAuthorize("hasAuthority('member')")
    fun updateResponsibilityNote(
        @PathVariable responsibilityYearId: String,
        @PathVariable id: String,
        authentication: JwtAuthenticationToken,
        @RequestBody noteBody: DtoInnResponsibilityNote,
    ): DtoOutResponsibilityYear {
        val user = gataUserService.getUser(id)
        val loggedInUser = gataUserService.getLoggedInUser(authentication)
        val isAdmin = authentication.authorities.find { it.authority == "admin" } != null
        if (loggedInUser.id != user.id && !isAdmin) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "Du kan ikke endre på noen andre sine ansvarsposter!")
        }

        validateUserIsMember(user)
        val responsibilityYear = responsibilityYearRepository.findById(UUID.fromString(responsibilityYearId)).get()
        responsibilityYear.note?.update(user, noteBody.text)
        return DtoOutResponsibilityYear(responsibilityYearRepository.save(responsibilityYear))
    }

    @PostMapping("{id}/contingent")
    @PreAuthorize("hasAuthority('admin')")
    fun postContingent(
        @PathVariable id: String,
        @RequestBody body: DtoInnContingent,
    ): List<DtoOutGataContingent> {
        val user = gataUserService.getUser(id)
        validateUserIsMember(user)
        val existingContingentOptional = gataContingentRepository.findByUserAndYear(user, body.year)

        if (existingContingentOptional.isPresent) {
            val existingContingent = existingContingentOptional.get()
            existingContingent.isPaid = body.isPaid
            gataContingentRepository.save(existingContingent)
        } else {
            val contingent = GataContingent(id = null, year = body.year, isPaid = body.isPaid, user)
            gataContingentRepository.save(contingent)
        }
        return gataContingentRepository.findAllByUser(user).map { DtoOutGataContingent(it) }
    }

    @PutMapping("{id}/subscribe")
    @PreAuthorize("hasAuthority('member')")
    fun updateSubscribe(
        @PathVariable id: String,
    ) {
        val user = gataUserService.getUser(id)
        user.subscribe = !user.subscribe
        gataUserRepository.save(user)
    }

    @PutMapping("{id}/externaluserproviders")
    @PreAuthorize("hasAuthority('admin')")
    fun updateExternalUserProviders(
        @PathVariable id: String,
        @RequestBody externalUserProviderIds: List<String>,
    ) {
        if (externalUserProviderIds.isEmpty()) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "En gatabruker må være tilknyttet en ekstern bruker")
        }
        val user = gataUserService.getUser(id)
        val externalUserProviders =
            externalUserRepository.findAllById(externalUserProviderIds).onEach { it.user = user }
        if (externalUserProviders.isEmpty())
            {
                throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Finner ikke eksterne brukere")
            }
        val removeExternalUserProviders =
            user.externalUserProviders.filter { !externalUserProviderIds.contains(it.id) }.onEach { it.user = null }

        externalUserRepository.saveAll(removeExternalUserProviders)
        // Todo: Check if we actually need to save the user aswell
        user.externalUserProviders = externalUserProviders
        gataUserRepository.save(user)
    }

    @PutMapping("{id}/primaryuser")
    @PreAuthorize("hasAuthority('admin')")
    fun updatePrimaryExternalUser(
        @PathVariable id: String,
        @RequestBody externalUserId: String,
    ) {
        val user = gataUserService.getUser(id)
        user.externalUserProviders.onEach {
            it.primary = it.id == externalUserId
        }
        gataUserRepository.save(user)
    }
}
