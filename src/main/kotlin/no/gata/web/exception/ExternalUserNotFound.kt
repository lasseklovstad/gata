package no.gata.web.exception

class ExternalUserNotFound(val id: String) : RuntimeException("Det finnes ingen ekstern bruker med id: $id")
