const fontData = {
    "Script": {
        "fullName": "MonotypeCorsiva", // work
        // "fullName": "Monotype-Corsiva-Regular", // home
        "sizeFactor": 1,
        "y-nudge": 0.25 / 8.0,
    },
    "Classic Script": {
        "fullName": "DancingScript-Regular",
        "sizeFactor": 1.0625,
        "y-nudge": 0.2 / 8.0,
    },
    "Italic": {
        "fullName": "GentiumBookPlus-Italic",
        "sizeFactor": 1,
        "y-nudge": 0.9 / 8.0,
    },
    "Serif": {
        "fullName": "Merriweather-Regular",
        "sizeFactor": 0.8125,
        "y-nudge": 0.45 / 8.0,
    },
    "Sans Serif": {
        "fullName": "Roboto-Medium",
        "sizeFactor": 0.75,
        "y-nudge": 0.4 / 8.0,
    },
    "Handwritten": {
        "fullName": "Caveat-Regular",
        "sizeFactor": 1.125,
        "y-nudge": 0.3 / 8.0,
    }
}

const counterData = {
    "Big": {
        "fontSize": 8,
        "numRows": 3,
        "numColumns": 4,
        "radius": 22.5,
        "bottomLeft": [27.0, 123.8],
        "bottomRight": [173.8, 124.0],
        "topRight": [173.6, 28.2]
    },
    "Medium": {
        "fontSize": 7,
        "numRows": 3,
        "numColumns": 5,
        "radius": 17.5,
        "bottomLeft": [22.07, 123.7],
        "bottomRight": [178.6, 124.0],
        "topRight": [178.5, 28.2]
    },
    "Small": {
        "fontSize": 6,
        "numRows": 5,
        "numColumns": 7,
        "radius": 12.5,
        "bottomLeft": [16.1, 133.2],
        "bottomRight": [184.0, 134.0],
        "topRight": [184.0, 18.8]
    },

}

const textInputWindow = new Window("dialog", "Enter Handle Text")

var jobData = {
    size: "Big",
    text: "debug",
    color: "White",
    font: "Script"
}

// counter size
var counterSizeOptionsGroup = textInputWindow.add("group")
counterSizeOptionsGroup.orientation = "column"
counterSizeOptionsGroup.add("statictext", undefined, "Counter Size")
var counterSizeOptions = counterSizeOptionsGroup.add("dropdownlist", undefined, ["Big", "Medium", "Small"])
counterSizeOptions.selection = "Big"
counterSizeOptions.onChange = function () {
    jobData.size = counterSizeOptions.selection.text
}

// color options
var counterColorOptionsGroup = textInputWindow.add("group")
counterColorOptionsGroup.orientation = "column"
counterColorOptionsGroup.add("statictext", undefined, "Counter Color:")
var counterColorOptions = counterColorOptionsGroup.add("dropdownlist", undefined, ["White", "50/50", "Black"])
counterColorOptions.selection = "White"
counterColorOptions.onChange = function () {
    jobData.color = counterColorOptions.selection.text
}

// font
var fontOptionsGroup = textInputWindow.add("group")
fontOptionsGroup.orientation = "column"
fontOptionsGroup.add("statictext", undefined, "Font:")
var fontOptions = fontOptionsGroup.add("dropdownlist", undefined, keys(fontData))
fontOptions.selection = "Script"
fontOptions.onChange = function () {
    jobData.font = fontOptions.selection.text
}

// text input
var textGroup = textInputWindow.add("group")
textGroup.orientation = "column"
textGroup.add("statictext", undefined, "Text:")
var text = textGroup.add("edittext", [0, 0, 150, 20], "")
text.onChange = function () {
    jobData.text = text.text
}

// run
var generateButton = textInputWindow.add("button", undefined, "Generate");
generateButton.onClick = function () {
    generateDocument()
    textInputWindow.close()
}

textInputWindow.show()

function keys(object) {
    const result = []
    for (var key in object) {
        result.push(key)
    }
    return result
}

function generateDocument() {

    // Preset
    var preset = new DocumentPreset()
    preset.units = RulerUnits.Millimeters // Illustrator still uses points internally
    preset.width = mmToPoints(210)
    preset.height = mmToPoints(148)

    // Create
    var document = app.documents.addDocument("Print", preset)
    
    // Artboard
    var artboard = document.artboards[0];
    artboard.artboardRect = [0, 0, document.width, -document.height] // Top-Left is (0, 0), Bottom-Right is (width, -height)
    
    // View
    var view = document.views[0];
    view.zoom = 1.3194352817; // Fit artboard in view (100% zoom)
    view.centerPoint = [document.width / 2, -document.height / 2] // Center the view on the document
    
    // Colors
    var whiteSpot = createSpotColor("RDG_WHITE", [25, 25, 25, 25])
    var primerSpot = createSpotColor("RDG_PRIMER", [50, 0, 100, 10])
    var guideSpot = createSpotColor("PerfCutContour", [70, 0, 0, 25])
    var grey = createCMYKColor(0, 0, 0, 60)
    var black = createCMYKColor(0, 0, 0, 100)

    
    const colorMap = {
        "White": whiteSpot,
        "Grey": grey,
        "Black": black,
    }
    
    // Font
    var fontName = jobData.font
    var font = app.textFonts.getByName(fontData[fontName].fullName)
    
    // Temp text for length
    var tempTextFrame = document.textFrames.add()
    tempTextFrame.textRange.characterAttributes.textFont = font
    tempTextFrame.contents = jobData.text
    tempTextFrame.textRange.characterAttributes.size = mmToPoints(counterData[jobData.size].fontSize) * fontData[fontName].sizeFactor
    var textWidth = tempTextFrame.width

    //

    const activeJig = counterData[jobData.size]
    
    //

    var diceBlackFile = new File("C:\\Users\\Roland\\Documents\\swiss_jigs\\assets\\Dice_Black.ai")
    var diceWhiteFile = new File("C:\\Users\\Roland\\Documents\\swiss_jigs\\assets\\Dice_White.ai")
    
    var baseDiceBlack = document.placedItems.add()
    baseDiceBlack.file = diceBlackFile
    var baseDiceWhite = document.placedItems.add()
    baseDiceWhite.file = diceWhiteFile
    
    //

    for (row = 0; row < activeJig.numRows; row++) {
        for (column = 0; column < activeJig.numColumns; column++) {
            var rowAmt = 1 - row / (activeJig.numRows - 1)
            var columnAmt = column / (activeJig.numColumns - 1)
            var x = activeJig.bottomLeft[0] + lerp(0, activeJig.bottomRight[0] - activeJig.bottomLeft[0], columnAmt)
            + lerp(0, activeJig.topRight[0] - activeJig.bottomRight[0], rowAmt)
            var y = activeJig.bottomLeft[1] + lerp(0, activeJig.bottomRight[1] - activeJig.bottomLeft[1], columnAmt)
                + lerp(0, activeJig.topRight[1] - activeJig.bottomRight[1], rowAmt)

            ///

            var radiusPt = mmToPoints(activeJig.radius)
            var xPt = mmToPoints(x)
            var yPt = -mmToPoints(y) // Illustrator y-axis goes downward

            var circle = document.pathItems.ellipse(
                yPt + radiusPt, // top coordinate
                xPt - radiusPt, // left coordinate
                radiusPt * 2,           // width
                radiusPt * 2            // height
            )

            circle.filled = false
            circle.stroked = true
            circle.strokeWidth = 0.5
            circle.strokeColor = guideSpot // Or use grey, whiteSpot, etc.

            var innerRadius = radiusPt - mmToPoints(7) // Margin inside the circle

            // Draw inner path for type-on-path
            var innerCircle = document.pathItems.ellipse(
                yPt + innerRadius, // top
                xPt - innerRadius, // left
                innerRadius * 2,
                innerRadius * 2
            )

            innerCircle.stroked = false
            innerCircle.filled = false

            // Add text on the path
            var pathText = document.textFrames.pathText(innerCircle)
            pathText.contents = jobData.text

            // Font and style
            pathText.textRange.characterAttributes.textFont = font
            pathText.textRange.characterAttributes.size = mmToPoints(counterData[jobData.size].fontSize) * fontData[fontName].sizeFactor

            // Rotate to top      
            var textAngleRadians = textWidth / innerRadius; // This is in points
            var textAngleDegrees = textAngleRadians * (180 / Math.PI);
            var textStartAngle = - 90 + (textAngleDegrees / 2);
            pathText.rotate(textStartAngle, true, true, true, true, Transformation.CENTER);


            // Generate Primer Underlay
            var primerText = pathText.duplicate()
            primerText.textRange.characterAttributes.fillColor = primerSpot
            pathText.zOrder(ZOrderMethod.BRINGTOFRONT)

            // Colour
            if (jobData.color === 'White') { // Colour of counters :S
                pathText.textRange.characterAttributes.fillColor = black
            } else if (jobData.color === 'Black') {
                pathText.textRange.characterAttributes.fillColor = whiteSpot
            } else if (jobData.color === '50/50') {
                if ((column * activeJig.numRows + row) % 2 == 0) {
                    pathText.textRange.characterAttributes.fillColor = black
                } else {
                    pathText.textRange.characterAttributes.fillColor = whiteSpot
                }
            }

            // Dice
            var diceInstance

            if (jobData.color === "White") {
                diceInstance = baseDiceBlack.duplicate()
            } else if (jobData.color === "Black") {
                diceInstance = baseDiceWhite.duplicate()
            } else {
                diceInstance = ((column * activeJig.numRows + row) % 2 === 0)
                    ? baseDiceBlack.duplicate()
                    : baseDiceWhite.duplicate()
            }

            diceInstance.position = [xPt - diceInstance.width / 2, yPt + diceInstance.height / 2]
            diceInstance.position = [diceInstance.position[0], diceInstance.position[1] - innerRadius]

            diceInstance.embed()

            // Arcs
            var leftArcStart = 90 + ( textAngleDegrees / 2 ) + 20 
            var leftArcEnd = 250
            var leftArc = drawArc(xPt, yPt, innerRadius, leftArcStart, leftArcEnd)
            leftArc.strokeWidth = 1
            var rightArcStart = 90 - (textAngleDegrees / 2) - 20
            var rightArcEnd = - 70
            var rightArc = drawArc(xPt, yPt, innerRadius, rightArcStart, rightArcEnd)
            rightArc.strokeWidth = 1

        }
    }

    baseDiceBlack.remove()
    baseDiceWhite.remove()

    app.activeDocument.selection = null

    // Functions

    function lerp(start, end, amt) {
        return start + amt * (end - start);
    }

    function createSpotColor(name, colorValues) {
        var newSpot = document.spots.add()
        newSpot.name = name
        newSpot.colorType = ColorModel.SPOT

        newSpot.color = new CMYKColor()
        newSpot.color.cyan = colorValues[0]
        newSpot.color.magenta = colorValues[1]
        newSpot.color.yellow = colorValues[2]
        newSpot.color.black = colorValues[3]

        var newSpotColor = new SpotColor()
        newSpotColor.spot = newSpot

        return newSpotColor
    }

    function setTextToFontSize(textFrame, fontName) {
        const aspectRatio = textFrame.width / textFrame.height
        textFrame.height = mmToPoints(counterData.Big.fontSize) * fontData[fontName].sizeFactor
        textFrame.width = textFrame.height * aspectRatio
    }

    function positionTextCenter(textFrame) {
        textFrame.position = [
            textFrame.position[0] - textFrame.width / 2,
            textFrame.position[1] + textFrame.height / 2
        ]
    }

    function createCMYKColor(cyan, magenta, yellow, key) {
        var newCMYKColor = new CMYKColor()
        newCMYKColor.black = key
        newCMYKColor.cyan = cyan
        newCMYKColor.magenta = magenta
        newCMYKColor.yellow = yellow

        return newCMYKColor
    }

    function drawArc(cx, cy, r, startDeg, endDeg) {
        var steps = 20;
        var path = document.pathItems.add();
        path.stroked = true;
        path.filled = false;

        var points = [];

        for (var i = 0; i <= steps; i++) {
            var t = i / steps;
            var angle = (startDeg + t * (endDeg - startDeg)) * Math.PI / 180;

            var px = cx + r * Math.cos(angle);
            var py = cy + r * Math.sin(angle);

            points.push([px, py]);
        }

        path.setEntirePath(points);
        return path;
    }

    // Units
    function mmToPoints(mm) { return mm * 72 / 25.4; }
    function pointsToMm(pts) { return pts * 25.4 / 72; }

}