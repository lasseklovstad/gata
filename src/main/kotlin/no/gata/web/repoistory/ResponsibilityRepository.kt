package no.gata.web.repoistory

import no.gata.web.models.Responsibility
import org.springframework.data.jpa.repository.JpaRepository
import java.util.*

interface ResponsibilityRepository: JpaRepository<Responsibility, UUID> {
}
