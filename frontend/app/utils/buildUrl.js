// export const buildUrl = (path, params) => {
//     return `phantom://${path}?${params.toString()}`;
//   };


  export const buildUrl = (path, params) => {
    // Try both formats based on Phantom docs
    // First format is phantom:// protocol
    // const url = `phantom://${path}?${params.toString()}`;
    
    // Second format is https://phantom.app/ul/v1/
    const url = `phantom://${path}?${params.toString()}`;
    
    console.log("Built URL:", url);
    return url;
  };