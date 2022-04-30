package no.gata.web.repository

import no.gata.web.models.GataRole
import org.springframework.data.jpa.repository.JpaRepository
import java.util.*

interface GataRoleRepository: JpaRepository<GataRole, UUID> {
    fun findByExternalUserProviderId(id: String): Optional<GataRole>
    fun findByName(name : String): Optional<GataRole>
}
