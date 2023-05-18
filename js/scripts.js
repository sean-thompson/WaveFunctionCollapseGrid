$(document).ready(function() {
    // Define the number of rows and cells
    var numRows = 20; // Number of rows
    var numCells = 20; // Number of cells per row
    var sampleSize = 3; // Size of the sample grid
    var sampleArray = []; // Array to store the changed samples

    // Predefined list of images to switch between
    var imageList = [
      "https://via.placeholder.com/50/808080?text=Soil", // Grey
      "https://via.placeholder.com/50/8f0032?text=Poppies", // Red
      "https://via.placeholder.com/50/fb3b24?text=Cosmos", // Orange
      "https://via.placeholder.com/50/ffe243?text=Begonia", // Yellow
      "https://via.placeholder.com/50/fff0be?text=Allium", // Beige
      "https://via.placeholder.com/50/98bc65?text=Plant" // Green
    ];
  
    // Create the table element
    var table = $("<table>").addClass("my-table");
  
    // Create the table rows with data
    for (var i = 0; i < numRows; i++) {
      var row = $("<tr>");
  
      // Add cells with images
      for (var j = 0; j < numCells; j++) {
        var cell = $("<td>");
        var imageIndex = 0; // First image in imageList is soil
        var imageSrc = imageList[imageIndex];
        var image = $("<img>").attr("src", imageSrc);
  
        // Click event to swap the plant
        image.on("click", function() {
          var currentIndex = imageList.indexOf($(this).attr("src"));
          var nextIndex = currentIndex % (imageList.length-1) + 1;
          $(this).attr("src", imageList[nextIndex]);
        });

        // Click event to return to soil
        image.on('contextmenu', function(event) {
          event.preventDefault(); // Prevent the default context menu behavior
      
          $(this).attr("src", imageList[0]);
        });
  
        cell.append(image);
        row.append(cell);
      }
  
      table.append(row);
    }
  
    // Append the table to the body
    $("body").append(table);

    // Add the grow button and grow functionality
    var growButton = $("<button>").text("Grow").on("click", function() {
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

      // mirror the samples
      var n = sampleArray.length - 1;
      while (n >= 0) {
        let value = [...sampleArray[n]];
        
        for (var i = 0; i < sampleSize; i++) {
          for (var j = 0; j < Math.floor(sampleSize/2); j++) {
            [value[sampleSize*i+j], value[sampleSize*i-j+sampleSize-1]] = [value[sampleSize*i-j+sampleSize-1], value[sampleSize*i+j]];
          }
        }

        sampleArray.push(value);
        n--;
      }

      // rotate the samples
      n = sampleArray.length - 1;
      while (n >= 0) {

        let before = [...sampleArray[n]];

        for (var m = 0; m<3; m++) {
          let after = []
          
          for (var i = 0; i < sampleSize; i++) {
            for (var j = 0; j < sampleSize; j++) {
              after.push(before[sampleSize**2 + i -sampleSize*j - sampleSize])
            }
          }

          sampleArray.push(after);
          before = [...after];
        }

        n--;
      }

      // remove duuplicates
      const countMap = {};
      const uniqueSamples = [];

      // Count duplicates using an object as a dictionary
      for (const subArray of sampleArray) {
        const key = JSON.stringify(subArray);
        countMap[key] = (countMap[key] || 0) + 1;
      }

      // Copy unique sub-arrays to the new array
      for (const subArray of sampleArray) {
        const key = JSON.stringify(subArray);
        if (!uniqueSamples.some((arr) => JSON.stringify(arr) === key)) {
          uniqueSamples.push(subArray);
        }
      }

      // Return the new array with count information
      let weightedSamples = uniqueSamples.map((subArray) => ({
        value: subArray,
        count: countMap[JSON.stringify(subArray)]
      }));

      //console.log(weightedSamples)
        
      // find all the possible matches for the next generation
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
                for (const test of weightedSamples) {

                    // record smples which can be replaced
                    if(sampleImages.every((value, index) => value == test.value[index] || value == imageList[0])) {
                        nextGeneration.push({"x":i, "y":j, "count":test.count, "value":test.value}) // This is the format of nextGeneration - X, Y, new values

                        //break; //TODO - don't break. record all options and use the one with least entropy
                    }
                }
              } 
            }
        }

        //randomise the order of tasks
        /*for (let i = nextGeneration.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [nextGeneration[i], nextGeneration[j]] = [nextGeneration[j], nextGeneration[i]];
        }*/

        //TODO - order the tasks by entropy
        nextGeneration.sort((a, b) => a.count - b.count)
        //console.log(nextGeneration)


        // Update the table
        nextGeneration.forEach((value) => {
            var index = 0;
            for (var x = value.x; x < value.x + sampleSize; x++) {
                for (var y = value.y; y < value.y + sampleSize; y++) {
                    var cellImage = table.find("tr").eq(x).find("td").eq(y).find("img");
                    cellImage.attr("src", value.value[index]);
                    index++;
                }
            }
        });
    });



    $("body").append(growButton);
  });
