$(document).ready(function() {
    // Define the number of rows and cells
    var numRows = 20; // Number of rows
    var numCells = 20; // Number of cells per row
    var sampleSize = 3; // Size of the sample grid
    var sampleArray = []; // Array to store the changed samples
  
    // Predefined list of images to switch between
    var imageList = [
      "https://via.placeholder.com/50/808080?text=Image+1", // Grey
      "https://via.placeholder.com/50/ff0000?text=Image+2", // Red
      "https://via.placeholder.com/50/00ff00?text=Image+3", // Green
      "https://via.placeholder.com/50/0000ff?text=Image+4" // Blue
    ];
  
    // Create the table element
    var table = $("<table>").addClass("my-table");
  
    // Create the table rows with data
    for (var i = 0; i < numRows; i++) {
      var row = $("<tr>");
  
      // Add cells with images
      for (var j = 0; j < numCells; j++) {
        var cell = $("<td>");
        var imageIndex = 0; // First image in imageList is grey
        var imageSrc = imageList[imageIndex];
        var image = $("<img>").attr("src", imageSrc);
  
        // Click event to swap the image
        image.on("click", function() {
          var currentIndex = imageList.indexOf($(this).attr("src"));
          var nextIndex = (currentIndex + 1) % imageList.length;
          $(this).attr("src", imageList[nextIndex]);
        });
  
        cell.append(image);
        row.append(cell);
      }
  
      table.append(row);
    }
  
    // Append the table to the body
    $("body").append(table);
  
    // Add the "Sample" button after the table
    var sampleButton = $("<button>").text("Sample").on("click", function() {
      sampleArray = []; // Reset the sample array
  
      // Loop through the cells in the table to sample
      for (var i = 0; i <= numRows - sampleSize; i++) {
        for (var j = 0; j <= numCells - sampleSize; j++) {
          var sampleImages = [];
  
          // Collect the URLs of the images in the sample
          for (var x = i; x < i + sampleSize; x++) {
            for (var y = j; y < j + sampleSize; y++) {
              var cellImage = table.find("tr").eq(x).find("td").eq(y).find("img");
              sampleImages.push(cellImage.attr("src"));
            }
          }
  
          // Add the sample to the array if it does not contain the first image
          if (!sampleImages.includes(imageList[0])) {
            sampleArray.push(sampleImages);
          }
        }
      }
    });
  
    $("body").append(sampleButton);

    var growButton = $("<button>").text("Grow").on("click", function() {
        
        const nextGeneration = [];

        for (var i = 0; i <= numRows - sampleSize; i++) {
            for (var j = 0; j <= numCells - sampleSize; j++) {
              var sampleImages = [];
      
              // Collect the URLs of the images in the sample
              for (var x = i; x < i + sampleSize; x++) {
                for (var y = j; y < j + sampleSize; y++) {
                  var cellImage = table.find("tr").eq(x).find("td").eq(y).find("img");
                  sampleImages.push(cellImage.attr("src"));
                }
              }

              // Look for samples which have a mix of set images and default images
              const count = sampleImages.filter(element => element === imageList[0]).length;
              if(count > 0 && count < sampleSize ** 2) {
                for (const test of sampleArray) {

                    // record smples which can be replaced
                    if(sampleImages.every((value, index) => value == test[index] || value == imageList[0])) {
                        nextGeneration.push([i, j, test]) // This is the format of nextGeneration - X, Y, new values

                        break; //TODO - don't break. record all options and use the one with least entropy
                    }
                }
              } 
            }
        }

        //randomise the order of taks
        for (let i = nextGeneration.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [nextGeneration[i], nextGeneration[j]] = [nextGeneration[j], nextGeneration[i]];
        }

        // Update the table
        nextGeneration.forEach((value) => {
            var index = 0;
            for (var x = value[0]; x < value[0] + sampleSize; x++) {
                for (var y = value[1]; y < value[1] + sampleSize; y++) {
                    var cellImage = table.find("tr").eq(x).find("td").eq(y).find("img");
                    cellImage.attr("src", value[2][index]);
                    index++;
                }
            }
        });
    });



    $("body").append(growButton);
  });
  