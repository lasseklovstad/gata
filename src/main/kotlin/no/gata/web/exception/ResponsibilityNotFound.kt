package no.gata.web.exception

class ResponsibilityNotFound(val id: String) : RuntimeException("Det finnes ansvarspost med id: $id")
