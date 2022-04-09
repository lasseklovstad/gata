package no.gata.web.models

import java.util.*
import javax.persistence.Entity
import javax.persistence.GeneratedValue
import javax.persistence.GenerationType
import javax.persistence.Id

@Entity
data class Role(
        @Id
        @GeneratedValue(strategy = GenerationType.AUTO)
        var id: UUID?,
        var name: String,
        var description: String
)
