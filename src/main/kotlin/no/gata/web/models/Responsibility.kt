package no.gata.web.models

import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.OneToMany
import java.util.UUID

@Entity
class Responsibility(
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    var id: UUID? = null,
    var name: String = "",
    var description: String = "",
    @OneToMany(mappedBy = "responsibility")
    var responsibilityYears: List<ResponsibilityYear>? = null,
)
