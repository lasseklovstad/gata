package no.gata.web.models

import com.fasterxml.jackson.annotation.JsonIgnore
import java.util.*
import javax.persistence.*

@Entity
data class Responsibility (
        @Id
        @GeneratedValue(strategy = GenerationType.AUTO)
        var id: UUID?,
        var name: String,
        var description: String,
        @OneToMany(mappedBy = "responsibility")
        @JsonIgnore
        var responsibilityYears: List<ResponsibilityYear>?
)
