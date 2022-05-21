package no.gata.web.repository

import no.gata.web.models.GataContingent
import no.gata.web.models.GataUser
import org.springframework.data.jpa.repository.JpaRepository
import java.time.Year
import java.util.*

interface GataContingentRepository: JpaRepository<GataContingent, UUID> {
    fun findAllByUser(user: GataUser): List<GataContingent>
    fun findByUserAndYear(user:GataUser, year: Year): Optional<GataContingent>
}
