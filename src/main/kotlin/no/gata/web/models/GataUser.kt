package no.gata.web.models

import java.util.*
import javax.persistence.*

@Entity
data class GataUser(
        @Id
        @GeneratedValue(strategy = GenerationType.AUTO)
        var id: UUID?,
        var externalUserProviderId: String,
        @OneToMany
        var responsibilities: List<Responsibility>,
)
