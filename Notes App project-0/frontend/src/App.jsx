import { useState, useEffect } from 'react'

const App = () => {

  const [title, setTitle] = useState('')
  const [details, setDetails] = useState('')
  const [toast, setToast] = useState({
    show: false,
    message: ''
  })

  // Notes will now come from MongoDB
  const [task, setTask] = useState([])


  // =========================
  // GET ALL NOTES
  // =========================

  const fetchNotes = async () => {
    try {

      const response = await fetch(
        "http://localhost:3000/notes"
      )

      const data = await response.json()

      // Store notes received from backend
      setTask(data.notes)

    } catch (error) {

      console.log(
        "Error fetching notes:",
        error
      )

    }
  }


  // =========================
  // CREATE NOTE
  // =========================

  const submitHandler = async (e) => {

    e.preventDefault()

    // Check empty fields
    if (
      title.trim() === '' ||
      details.trim() === ''
    ) {

      setToast({
        show: true,
        message:
          'Please fill in both the title and details fields.'
      })

      setTimeout(() => {

        setToast({
          show: false,
          message: ''
        })

      }, 3000)

      return
    }


    try {

      // Send note to backend
      const response = await fetch(
        "http://localhost:3000/notes",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({

            title: title,

            // Backend expects "description"
            description: details,

          }),
        }
      )


      const data = await response.json()

      console.log(data)


      // Get latest notes from database
      fetchNotes()


      // Clear inputs
      setTitle('')
      setDetails('')


    } catch (error) {

      console.log(
        "Error creating note:",
        error
      )

    }
  }


  // =========================
  // DELETE NOTE
  // =========================

  const deleteNote = async (id) => {

    try {

      // Send MongoDB _id to backend
      const response = await fetch(
        `http://localhost:3000/notes/${id}`,
        {
          method: "DELETE",
        }
      )


      const data = await response.json()

      console.log(data)


      // Get updated notes
      fetchNotes()


    } catch (error) {

      console.log(
        "Error deleting note:",
        error
      )

    }
  }


  // =========================
  // FETCH NOTES WHEN APP LOADS
  // =========================

  useEffect(() => {

    fetchNotes()

  }, [])


  // =========================
  // ENTER KEY HANDLER
  // =========================

  useEffect(() => {

    const handleKeyDown = (e) => {

      if (
        e.key === 'Enter' &&
        e.target.tagName !== 'INPUT' &&
        e.target.tagName !== 'TEXTAREA'
      ) {

        submitHandler({
          preventDefault: () => { }
        })

      }

    }


    document.addEventListener(
      'keydown',
      handleKeyDown
    )


    return () => {

      document.removeEventListener(
        'keydown',
        handleKeyDown
      )

    }

  }, [title, details])


  return (

    <div className='h-screen lg:flex bg-black pt-8 text-white'>


      {/* =========================
          LEFT SIDE
          ADD NOTE
      ========================= */}

      <form
        onSubmit={submitHandler}
        className='flex gap-4 lg:w-1/2 p-10 flex-col items-start relative'
      >


        {/* Toast */}

        {toast.show && (

          <div className='absolute top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg font-semibold z-50 animate-pulse'>

            {toast.message}

          </div>

        )}


        <h1 className='text-4xl mb-2 pt-25 font-bold'>

          Add Notes

        </h1>


        {/* TITLE */}

        <input

          type="text"

          placeholder='Enter Notes Heading'

          className='px-5 w-full font-medium py-2 border-2 outline-none rounded'

          value={title}

          onChange={(e) => {

            setTitle(e.target.value)

          }}

        />


        {/* DESCRIPTION */}

        <textarea

          className='px-5 w-full font-medium h-32 py-2 flex items-start flex-row border-2 outline-none rounded'

          placeholder='Write Details here'

          value={details}

          onChange={(e) => {

            setDetails(e.target.value)

          }}

        />


        {/* SUBMIT */}

        <button

          type="submit"

          className='bg-white cursor-pointer active:scale-95 font-medium w-full outline-none hover:bg-gray-200 text-black px-5 py-2 rounded'

        >

          Add Note

        </button>


      </form>


      {/* =========================
          RIGHT SIDE
          DISPLAY NOTES
      ========================= */}

      <div className='lg:w-1/2 lg:border-l-2 p-10'>


        <h1 className='text-4xl font-bold'>

          Recent Notes

        </h1>


        <div className='flex flex-wrap items-start justify-start gap-5 mt-6 h-[90%] overflow-auto'>


          {task.map((elem) => {

            return (

              <div

                key={elem._id}

                className="flex justify-between flex-col items-start relative h-52 w-40 bg-cover rounded-xl text-black pt-9 pb-4 px-4 bg-[url('https://static.vecteezy.com/system/resources/previews/037/152/677/non_2x/sticky-note-paper-background-free-png.png')]"

              >


                <div>

                  <h3 className='leading-tight text-lg font-bold'>

                    {elem.title}

                  </h3>


                  <p className='mt-2 leading-tight text-xs font-semibold text-gray-600'>

                    {elem.description}

                  </p>

                </div>


                {/* DELETE */}

                <button

                  onClick={() => {

                    deleteNote(elem._id)

                  }}

                  className='w-full cursor-pointer hover:bg-red-600 active:scale-95 bg-red-500 py-1 text-xs rounded font-bold text-white'

                >

                  Delete

                </button>


              </div>

            )

          })}


        </div>

      </div>


    </div>

  )

}

export default App

