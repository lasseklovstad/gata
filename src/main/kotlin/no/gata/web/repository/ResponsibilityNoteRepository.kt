package no.gata.web.repository

import no.gata.web.models.ResponsibilityNote
import no.gata.web.models.ResponsibilityYear
import org.springframework.data.jpa.repository.JpaRepository
import java.util.*

interface ResponsibilityNoteRepository: JpaRepository<ResponsibilityNote, UUID> {
}
