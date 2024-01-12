package no.gata.web.models

import com.fasterxml.jackson.annotation.JsonIgnore
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import java.util.UUID

@Entity
class GataContingent(
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    var id: UUID? = null,
    @Column(columnDefinition = "SMALLINT")
    var year: Int = 0,
    var isPaid: Boolean = false,
    @ManyToOne
    @JoinColumn(name = "gata_user_id")
    @JsonIgnore
    var user: GataUser? = null,
)
