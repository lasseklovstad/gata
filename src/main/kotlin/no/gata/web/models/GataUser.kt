package no.gata.web.models

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.annotation.JsonManagedReference
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
        @OneToMany(mappedBy = "user")
        @JsonIgnore
        var responsibilities: List<ResponsibilityYear>,
        @ManyToMany()
        var roles: List<GataRole>,
        @OneToMany(mappedBy = "user")
        var contingents: List<GataContingent>
){
        fun getIsUserMember(): Boolean {
                return roles.find { it.name=="Medlem" } != null
        }

        fun getIsUserAdmin(): Boolean {
                return roles.find { it.name=="Administrator" } != null
        }
}
