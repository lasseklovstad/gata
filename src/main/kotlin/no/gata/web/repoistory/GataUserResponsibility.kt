package no.gata.web.repoistory

import no.gata.web.models.GataUser
import org.springframework.data.jpa.repository.JpaRepository
import java.util.*

interface GataUserResponsibility: JpaRepository<GataUser, UUID> {
    override fun findById(userId: UUID): Optional<GataUser>
    fun findByExternalUserProviderId(userId: String): Optional<GataUser>
}
