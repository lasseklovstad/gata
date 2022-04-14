package no.gata.web.models

import com.fasterxml.jackson.annotation.JsonBackReference
import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.annotation.JsonInclude
import com.fasterxml.jackson.annotation.JsonIncludeProperties
import java.util.*
import javax.persistence.*

@Entity
data class Responsibility (
        @Id
        @GeneratedValue(strategy = GenerationType.AUTO)
        var id: UUID?,
        var name: String,
        var description: String,
        @ManyToOne
        @JsonIncludeProperties("id", "name")
        var user: GataUser?
)
