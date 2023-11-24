package no.gata.web.repository

import no.gata.web.models.GataUser
import no.gata.web.models.Responsibility
import no.gata.web.models.ResponsibilityYear
import org.springframework.data.jpa.repository.JpaRepository
import java.time.Year
import java.util.*

interface ResponsibilityYearRepository: JpaRepository<ResponsibilityYear, UUID> {
    fun findResponsibilityYearsByUser(user: GataUser): List<ResponsibilityYear>
    fun findResponsibilityYearsByResponsibility(responsibility: Responsibility): List<ResponsibilityYear>
    fun findResponsibilityYearsByUserAndYearAndResponsibility(user: GataUser, year: Int, responsibility: Responsibility): List<ResponsibilityYear>
    fun findResponsibilityYearsByUserId(userId: UUID): List<ResponsibilityYear>
    fun findResponsibilityYearsByYearEquals(year: Year): List<ResponsibilityYear>
}
