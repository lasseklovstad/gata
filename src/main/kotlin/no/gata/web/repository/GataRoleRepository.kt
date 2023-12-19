package no.gata.web.repository

import no.gata.web.models.GataRole
import no.gata.web.models.UserRoleName
import org.springframework.data.jpa.repository.JpaRepository
import java.util.*

interface GataRoleRepository: JpaRepository<GataRole, UUID> {
    fun findByRoleName(roleName: UserRoleName): Optional<GataRole>
}
