package no.gata.web.repository

import no.gata.web.models.GataRole
import no.gata.web.models.GataUser
import org.springframework.data.jpa.repository.JpaRepository
import java.util.Optional
import java.util.UUID

interface GataUserRepository : JpaRepository<GataUser, UUID> {
    override fun findById(userId: UUID): Optional<GataUser>

    fun findByExternalUserProvidersId(userId: String): Optional<GataUser>

    fun findAllByRolesEquals(role: GataRole): List<GataUser>
}
