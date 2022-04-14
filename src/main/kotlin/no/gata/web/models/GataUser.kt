package no.gata.web.models

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import java.util.*
import javax.persistence.*

@Entity
data class GataUser(
        @Id
        @GeneratedValue(strategy = GenerationType.AUTO)
        var id: UUID?,
        var externalUserProviderId: String,
        var name: String,
        var email: String,
        var picture: String,
        @OneToMany
        var responsibilities: Set<Responsibility>,
        @ManyToMany()
        @JsonIgnoreProperties("users")
        var roles: List<GataRole>
){
        fun getIsUserMember(): Boolean {
                return roles.find { it.name=="Medlem" } != null
        }

        fun getIsUserAdmin(): Boolean {
                return roles.find { it.name=="Administrator" } != null
        }
}
