package no.gata.web.models

class RichTextBlock(
        var type: String,
        var children: List<Any>,
        var imageId: String?,
        var size: Int?
)
