package no.gata.web.repository

import no.gata.web.models.Responsibility
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface ResponsibilityRepository : JpaRepository<Responsibility, UUID>
