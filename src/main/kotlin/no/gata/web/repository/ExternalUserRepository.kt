package no.gata.web.repository

import no.gata.web.models.ExternalUser
import org.springframework.data.jpa.repository.JpaRepository

interface ExternalUserRepository : JpaRepository<ExternalUser, String> {
    fun findAllByUserIsNull(): List<ExternalUser>
}
